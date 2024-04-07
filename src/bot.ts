import { mempool } from './mempool.js';
//import { RaydiumAmmCoder } from 'raydium_amm/dist/esm/coder/index.js';
import ClmmIdl from './idl/idl3.json' assert { type: 'json' };
import Raydium from './idl/idl.json' assert { type: 'json' };
// import { connection } from './clients/rpc.js';
// import { AddressLookupTableAccount } from '@solana/web3.js';
import {
  SolanaParser,
  parseTransactionAccounts,
} from '@debridge-finance/solana-transaction-parser';
import { connection } from './clients/rpc.js';
import {
  AccountInfo,
  AddressLookupTableAccount,
  Connection,
  LoadedAddresses,
  MessageAccountKeys,
  ParsedAccountData,
  PublicKey,
  VersionedTransaction,
} from '@solana/web3.js';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes/index.js';
import { lookupTableProvider } from './lookup-table-provider.js';
import { logger } from './logger.js';
import {
  TOKEN_2022_PROGRAM_ID,
  createAccount,
  createAssociatedTokenAccount,
  getAccount,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token-3';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  JsonMetadata,
  Metaplex,
  TokenAccount,
  WRAPPED_SOL_MINT,
} from '@metaplex-foundation/js';
import { keypair } from './clients/jito.js';
import {
  Liquidity,
  LiquidityPoolKeys,
  Percent,
  SPL_ACCOUNT_LAYOUT,
  Spl,
  Token,
  TokenAmount,
  TxVersion,
  buildSimpleTransaction,
  jsonInfo2PoolKeys,
} from '@raydium-io/raydium-sdk';
import assert from 'assert';
import { formatAmmKeysById } from './formatAmmKeysById.js';
import BN from 'bn.js';
import {
  RAYDIUM_AMM_V4_PROGRAM_ID,
  RAYDIUM_CLMM_PROGRAM_ID,
} from '@jup-ag/core';
import { BorshCoder, Idl } from '@coral-xyz/anchor';
import base58 from 'bs58';
import { Jupiter, IDL as JupiterIdl } from './idl/jupiter.js';
import { Message } from 'jito-ts/dist/gen/geyser/confirmed_block.js';

// import { simulate } from './simulation.js';
// import { postSimulateFilter } from './post-simulation-filter.js';
// import { preSimulationFilter } from './pre-simulation-filter.js';
// import { calculateArb } from './calculate-arb.js';
// import { buildBundle } from './build-bundle.js';
// import { sendBundle } from './send-bundle.js';

const metaplex = new Metaplex(connection);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getLuts(transaction) {
  const LUTs = (
    await Promise.all(
      transaction.message.addressTableLookups.map((acc) =>
        connection.getAddressLookupTable(acc.accountKey),
      ),
    )
  )
    .map((lut) => lut.value)
    .filter((val) => val !== null) as AddressLookupTableAccount[];
  return transaction.message
    .getAccountKeys({ addressLookupTableAccounts: LUTs })
    .keySegments()
    .reduce((acc, cur) => acc.concat(cur), []);
}
async function getResolvedLoaded(transaction: VersionedTransaction) {
  const LUTs = (
    await Promise.all(
      transaction.message.addressTableLookups.map((acc) =>
        connection.getAddressLookupTable(acc.accountKey),
      ),
    )
  )
    .map((lut) => lut.value)
    .filter((val) => val !== null) as AddressLookupTableAccount[];
  return transaction.message.getAccountKeys({
    addressLookupTableAccounts: LUTs,
  }).accountKeysFromLookups;
}

interface MintAccReturnType {
  mint: PublicKey;
  name: string;
  decimals: number;
  isWSOL: boolean;
}

export async function getWalletTokenAccount(
  connection: Connection,
  wallet: PublicKey,
): Promise<TokenAccount[]> {
  const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID,
  });
  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  }));
}
// @return {name, mintAddr}

async function getMintAndAccount(
  account: PublicKey,
): Promise<void | MintAccReturnType> {
  try {
    const accountReadResponse = await connection.getParsedAccountInfo(account);
    if (accountReadResponse) {
      // account exists
      //console.log(accountReadResponse);
      if (accountReadResponse.value.data instanceof Buffer) {
        //skip, cannot parse this
        throw Error('buffer, cannot parse accdata');
      } else {
        //ParsedAccountData
        const parsedAccountData = accountReadResponse.value
          .data as ParsedAccountData;
        //console.log(parsedAccountData.parsed);
        //get mint
        const mint = parsedAccountData.parsed.info.mint;
        //get name
        const nftResponse = await metaplex
          .nfts()
          .findByMint({ mintAddress: new PublicKey(mint) });
        console.log(nftResponse);
        console.log('name:', nftResponse.name);
        console.log('decimals:', nftResponse.mint.decimals);

        return {
          mint: new PublicKey(mint),
          name: nftResponse.name,
          decimals: nftResponse.mint.decimals,
          isWSOL: nftResponse.mint.isWrappedSol,
        };
      }
    }
  } catch (error) {
    console.log('getMintAndAccount:', error);
  }
}

async function makeTradeInstructions(
  sourceMint: PublicKey,
  destMint: PublicKey,
  ammId: PublicKey,
  amountIn: BN,
  minAmountOutA: BN,
) {
  console.log(arguments);
  //make simple swap instruction then return the versionedtx[]
  const targetPoolInfo = await formatAmmKeysById(ammId.toBase58());
  assert(targetPoolInfo, 'cannot find the target pool');
  const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys;

  const sourceToken = new Token(TOKEN_PROGRAM_ID, sourceMint, 9);
  const destToken = new Token(TOKEN_PROGRAM_ID, destMint, 9);

  const sourceAmount = new TokenAmount(sourceToken, amountIn);
  const destAmount = new TokenAmount(destToken, minAmountOutA);

  // -------- step 1: coumpute amount out --------
  const { amountOut, minAmountOut } = Liquidity.computeAmountOut({
    poolKeys: poolKeys,
    poolInfo: await Liquidity.fetchInfo({ connection, poolKeys }),
    amountIn: sourceAmount,
    currencyOut: destToken,
    slippage: new Percent(50, 100),
  });

  // -------- step 2: create instructions by SDK function --------
  const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
    connection,
    poolKeys,
    userKeys: {
      tokenAccounts: input.walletTokenAccounts,
      owner: input.wallet.publicKey,
    },
    amountIn: input.inputTokenAmount,
    amountOut: minAmountOut,
    fixedSide: 'in',
    makeTxVersion: TxVersion.V0,
  });

  const recentBlockHash = await connection.getLatestBlockhash();
  const built = await buildSimpleTransaction({
    connection,
    makeTxVersion: TxVersion.V0,
    payer: keypair.publicKey,
    innerTransactions,
    recentBlockhash: recentBlockHash.blockhash,
  });
  for (const tx of built) {
    if (tx instanceof VersionedTransaction) {
      await connection.sendTransaction(tx);
    } else {
      await connection.sendTransaction(tx, [keypair]);
    }
  }
}

interface ScoreKeeper {
  [key: string]: { occurences: number; totalFees: BN };
}

const scorekeeper: ScoreKeeper = {};
let pajeetSpamTx = 0;

for await (const mempoolUpdate of mempool()) {
  try {
    for (const transaction of mempoolUpdate.txns) {
      const signature = base58.encode(transaction.signatures[0]);
      console.log(signature);
      const solanaParser = new SolanaParser([
        { idl: ClmmIdl as Idl, programId: RAYDIUM_CLMM_PROGRAM_ID },
        { idl: Raydium as Idl, programId: RAYDIUM_AMM_V4_PROGRAM_ID },
        {
          idl: JupiterIdl as Idl,
          programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        },
      ]);
      const resolved = await getResolvedLoaded(transaction);
      console.log(resolved);

      const lutAddress: LoadedAddresses = {
        writable: [],
        readonly: [],
      };

      lutAddress.readonly = resolved.readonly;
      lutAddress.writable = resolved.writable;

      const parsed = await solanaParser.parseTransactionData(
        transaction.message,
        resolved,
      );
      console.dir(parsed, null);

      if (parsed) {
        for (const pix of parsed) {
          if (pix.name.includes('swap')) {
            // console.log(pix);
            const poolStatePluck = pix.accounts.filter(
              (account) => account.name === 'poolState',
            );
            const ammId = poolStatePluck[0].pubkey.toBase58();
            //get fee
            const fee = await connection.getFeeForMessage(transaction.message);
            //high score, send transaction
            makeTradeInstructions(
              poolStatePluck[6].pubkey.toBase58(),
              poolStatePluck[7].pubkey.toBase58(),
              ammId,
              poolStatePluck,
              pix.args.amount,
              0,
            );

            if (ammId) {
              if (!scorekeeper[ammId]) {
                scorekeeper[ammId] = {
                  occurences: 1,
                  totalFees: new BN(fee.value),
                };
              } else {
                scorekeeper[ammId].occurences++;
                scorekeeper[ammId].totalFees = scorekeeper[ammId].totalFees.add(
                  new BN(fee.value),
                );
              }
            } else {
              console.log('failed!');
            }
            console.log(scorekeeper);

            //console.log("pajeetSpamTx:",pajeetSpamTx);
          }
          // if (pix.name === 'swapV2') {
          //   console.log(pix);
          //   console.log(pix.accounts);
          // }
        }
      } else {
        pajeetSpamTx += 1;
      }
    }
  } catch (error) {
    // eslint-disable-next-line
    console.log(error);
    if ((error as Error).name !== 'RangeError') {
      console.log(error);
    }
  } finally {
    // eslint-disable-next-line
    continue;
  }
}
// these are async generators, so essentially streams, but typed
// const mempoolUpdates = mempool();
// const coder = new RaydiumAmmCoder(idl as Idl);
// for await (const mempoolUpdate of mempoolUpdates) {
//     for (const txn of mempoolUpdate.txns) {
//         //use the raydium decoder to decode txns
//         for (const instruction of txn.message.compiledInstructions) {
//             try {
//                 // console.log(Buffer.from(txn.signatures[0]).toString("hex"));
//                 //  console.log("instruction:",instruction);
//                 const serializedInsData = Buffer.from(instruction.data);
//                 //console.log(serializedInsData.toString("hex"));
//                 const decoded = coder.instruction.decode(serializedInsData);
//                 // eslint-disable-next-line
//                 if (decoded.hasOwnProperty("swapBaseIn")) {

//                     const LUTs = (await Promise.all(txn.message.addressTableLookups
//                         .map((acc) => connection.getAddressLookupTable(acc.accountKey))))
//                         .map((lut) => lut.value).filter((val) => val !== null) as AddressLookupTableAccount[];
//                     const allAccs = txn.message.getAccountKeys({ addressLookupTableAccounts: LUTs })
//                         .keySegments().reduce((acc, cur) => acc.concat(cur), []);
//                     console.log(allAccs);
//                     console.log("FOUND!!:", decoded);
//                     //get token0
//                     console.log("ammId:",allAccs[2].toString());
//                     console.log("tokenA:",allAccs[14].toString());

//                     console.log("tokenB:",allAccs[15].toString());

//                 }
//             } catch (error) {
//                 // console.log(error);
//             } finally { // eslint-disable-line
//                 //esl
//                 continue; // eslint-disable-line
//             }
//         }
//     }
// }
// const filteredTransactions = preSimulationFilter(mempoolUpdates);
// const simulations = simulate(filteredTransactions);
// const backrunnableTrades = postSimulateFilter(simulations);
// const arbIdeas = calculateArb(backrunnableTrades);
// const bundles = buildBundle(arbIdeas);
// await sendBundle(bundles);
