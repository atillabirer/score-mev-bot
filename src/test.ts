import { connection } from './clients/rpc.js';
import { Connection, PublicKey } from '@solana/web3.js';
import Websocket from 'ws';
import { SolanaParser } from '@debridge-finance/solana-transaction-parser';
import Raydium from './idl/idl.json' assert { type: 'json' };
import ClmmIdl from './idl/idl3.json' assert { type: 'json' };

import { Idl } from '@coral-xyz/anchor';
import { RAYDIUM_AMM_V4_PROGRAM_ID } from '@jup-ag/core';
import BN from 'bn.js';
import { formatUnits } from 'ethers';
import { LIQUIDITY_STATE_LAYOUT_V4, LIQUIDITY_STATE_LAYOUT_V5 } from '@raydium-io/raydium-sdk';

const ws = new Websocket(
  'wss://methodical-long-dust.solana-mainnet.quiknode.pro/870f16040a2c16cfd4b5217a6d6e0f28fc1a6438/',
);

const conn = new Connection(
  'https://methodical-long-dust.solana-mainnet.quiknode.pro/870f16040a2c16cfd4b5217a6d6e0f28fc1a6438/',
  {
    commitment: 'confirmed',
    disableRetryOnRateLimit: false,
  },
);

interface ScoreKeeper {
  [key: string]: {
    occurences: number;
    totalFees: number;
    totalFeesFriendly: string;
    poolOpenTime: number;
  };
}

const scorekeeper: ScoreKeeper = {};

const solanaParser = new SolanaParser([
  {
    idl: ClmmIdl as Idl,
    programId: 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK',
  },
]);
const message = {
  jsonrpc: '2.0',
  id: '1',
  method: 'blockSubscribe',
  params: [
    {
      mentionsAccountOrProgram: 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK',
    },
    {
      encoding: 'json',
      maxSupportedTransactionVersion: 0,
      transactionDetails: 'full',
      rewards: false,
      commitment: 'confirmed',
    },
  ],
};

ws.on('open', () => {
  ws.send(JSON.stringify(message));
});
ws.on('message', async (data) => {
  const obj = JSON.parse(data.toString());
  if (obj.method && obj.method === 'blockNotification') {
    for (const tx of obj.params.result.value.block.transactions) {
      //get tx
      //console.log(tx);
      const parsed = await solanaParser.parseTransaction(
        conn,
        tx.transaction.signatures[0],
        true,
        'confirmed',
      );
      
      if (parsed) {
        
        for (const pix of parsed) {
          
          if (pix.name.includes('swap')) {
            console.dir(pix.accounts,null);
            console.log(pix.args);
            // console.log(pix);
            const poolStatePluck = pix.accounts.filter(
              (account) => account.name === 'poolState',
            );
            const ammId = poolStatePluck[0].pubkey.toBase58();
            //get pool open time
            const data = await connection
              .getAccountInfo(
                new PublicKey(ammId),
              )
              .then((info) => LIQUIDITY_STATE_LAYOUT_V5.decode(info.data));

            if (ammId) {
              if (!scorekeeper[ammId]) {
                scorekeeper[ammId] = {
                  poolOpenTime: data.poolOpenTime.toNumber(),
                  occurences: 1,
                  totalFees: tx.meta.fee,
                  totalFeesFriendly: formatUnits(tx.meta.fee, 9),
                };
              } else {
                scorekeeper[ammId].occurences++;
                scorekeeper[ammId].totalFees = tx.meta.fee;
                scorekeeper[ammId].totalFeesFriendly = formatUnits(
                  scorekeeper[ammId].totalFees,
                  9,
                );
              }
            } else {
              console.log('failed!');
            }
            //console.log(scorekeeper);

            //console.log("pajeetSpamTx:",pajeetSpamTx);
          }
          // if (pix.name === 'swapV2') {
          //   console.log(pix);
          //   console.log(pix.accounts);
          // }
        }
      }
    }
  }
});
