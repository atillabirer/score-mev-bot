import {
    LIQUIDITY_STATE_LAYOUT_V5
} from "@raydium-io/raydium-sdk"
import {connection} from "./clients/rpc.js"
import {PublicKey} from "@solana/web3.js"
(async function() {
const data = await connection
   .getAccountInfo(new PublicKey("6kT4MhDqKrkWikaGpFCvYsk45BUKXEe2gTpNGAR1YcjS"))
   .then((info) => LIQUIDITY_STATE_LAYOUT_V5.decode(info.data))

  console.log(data)
})()


