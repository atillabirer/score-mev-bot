import { mempool } from './mempool.js';
import { RaydiumAmmCoder } from "raydium_amm/dist/esm/coder/index.js";
import {Idl} from "raydium_amm/node_modules/@coral-xyz/anchor";
import idl from "./idl/idl.json" assert {type:"json"};
import { BN } from '@coral-xyz/anchor';
// import { simulate } from './simulation.js';
// import { postSimulateFilter } from './post-simulation-filter.js';
// import { preSimulationFilter } from './pre-simulation-filter.js';
// import { calculateArb } from './calculate-arb.js';
// import { buildBundle } from './build-bundle.js';
// import { sendBundle } from './send-bundle.js';

interface swapBaseInObj {
    swapBaseIn: {amountIn: BN, minAmountOut: BN}
}


// these are async generators, so essentially streams, but typed
const mempoolUpdates = mempool();
const coder = new RaydiumAmmCoder(idl as Idl);
for await(const mempoolUpdate of mempoolUpdates) {
   for(const txn of mempoolUpdate.txns) {
    //use the raydium decoder to decode txns
    for(const instruction of txn.message.compiledInstructions) {
        try {
           // console.log(Buffer.from(txn.signatures[0]).toString("hex"));
          //  console.log("instruction:",instruction);
            const serializedInsData = Buffer.from(instruction.data);
        //console.log(serializedInsData.toString("hex"));
        const decoded = coder.instruction.decode(serializedInsData);
        // eslint-disable-next-line
        if(decoded.hasOwnProperty("swapBaseIn")) {
            console.log("accountKeys:",txn.message.getAccountKeys());
            
            const transposed: swapBaseInObj = decoded as swapBaseInObj;
            txn.message.staticAccountKeys.forEach((v,i) => {
                console.log(`[${i}] ${v}`)
            })
            

            console.log("FOUND!!:",decoded);
            console.log("amountIn:",transposed.swapBaseIn.amountIn.toString());
            
            console.log("minAmountOut:",transposed.swapBaseIn.minAmountOut.toString());
        }
        } catch (error) {
           // console.log(error);
        } finally { // eslint-disable-line
            //esl
            continue; // eslint-disable-line
        }
    }
   }
}
// const filteredTransactions = preSimulationFilter(mempoolUpdates);
// const simulations = simulate(filteredTransactions);
// const backrunnableTrades = postSimulateFilter(simulations);
// const arbIdeas = calculateArb(backrunnableTrades);
// const bundles = buildBundle(arbIdeas);
// await sendBundle(bundles);
