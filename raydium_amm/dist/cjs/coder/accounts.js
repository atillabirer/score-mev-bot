"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaydiumAmmAccountsCoder = void 0;
// @ts-nocheck
const B = __importStar(require("@native-to-anchor/buffer-layout"));
class RaydiumAmmAccountsCoder {
    constructor(_idl) { }
    async encode(accountName, account) {
        switch (accountName) {
            case "targetOrders": {
                const buffer = Buffer.alloc(2208);
                const len = TARGET_ORDERS_LAYOUT.encode(account, buffer);
                return buffer.slice(0, len);
            }
            case "fees": {
                const buffer = Buffer.alloc(64);
                const len = FEES_LAYOUT.encode(account, buffer);
                return buffer.slice(0, len);
            }
            case "ammInfo": {
                const buffer = Buffer.alloc(752);
                const len = AMM_INFO_LAYOUT.encode(account, buffer);
                return buffer.slice(0, len);
            }
            default: {
                throw new Error(`Invalid account name: ${accountName}`);
            }
        }
    }
    decode(accountName, ix) {
        return this.decodeUnchecked(accountName, ix);
    }
    decodeUnchecked(accountName, ix) {
        switch (accountName) {
            case "targetOrders": {
                return decodeTargetOrdersAccount(ix);
            }
            case "fees": {
                return decodeFeesAccount(ix);
            }
            case "ammInfo": {
                return decodeAmmInfoAccount(ix);
            }
            default: {
                throw new Error(`Invalid account name: ${accountName}`);
            }
        }
    }
    memcmp(accountName, _appendData) {
        switch (accountName) {
            case "targetOrders": {
                return {
                    dataSize: 2208,
                };
            }
            case "fees": {
                return {
                    dataSize: 64,
                };
            }
            case "ammInfo": {
                return {
                    dataSize: 752,
                };
            }
            default: {
                throw new Error(`Invalid account name: ${accountName}`);
            }
        }
    }
    size(idlAccount) {
        switch (idlAccount.name) {
            case "targetOrders": {
                return 2208;
            }
            case "fees": {
                return 64;
            }
            case "ammInfo": {
                return 752;
            }
            default: {
                throw new Error(`Invalid account name: ${idlAccount.name}`);
            }
        }
    }
}
exports.RaydiumAmmAccountsCoder = RaydiumAmmAccountsCoder;
function decodeTargetOrdersAccount(ix) {
    return TARGET_ORDERS_LAYOUT.decode(ix);
}
function decodeFeesAccount(ix) {
    return FEES_LAYOUT.decode(ix);
}
function decodeAmmInfoAccount(ix) {
    return AMM_INFO_LAYOUT.decode(ix);
}
const TARGET_ORDERS_LAYOUT = B.struct([
    B.seq(B.u64(), 4, "owner"),
    B.seq(B.struct([B.u64("price"), B.u64("vol")]), 50, "buyOrders"),
    B.seq(B.u64(), 8, "padding1"),
    B.u128("targetX"),
    B.u128("targetY"),
    B.u128("planXBuy"),
    B.u128("planYBuy"),
    B.u128("planXSell"),
    B.u128("planYSell"),
    B.u128("placedX"),
    B.u128("placedY"),
    B.u128("calcPnlX"),
    B.u128("calcPnlY"),
    B.seq(B.struct([B.u64("price"), B.u64("vol")]), 50, "sellOrders"),
    B.seq(B.u64(), 6, "padding2"),
    B.seq(B.u64(), 10, "replaceBuyClientId"),
    B.seq(B.u64(), 10, "replaceSellClientId"),
    B.u64("lastOrderNumerator"),
    B.u64("lastOrderDenominator"),
    B.u64("planOrdersCur"),
    B.u64("placeOrdersCur"),
    B.u64("validBuyOrderNum"),
    B.u64("validSellOrderNum"),
    B.seq(B.u64(), 10, "padding3"),
    B.u128("freeSlotBits"),
]);
const FEES_LAYOUT = B.struct([
    B.u64("minSeparateNumerator"),
    B.u64("minSeparateDenominator"),
    B.u64("tradeFeeNumerator"),
    B.u64("tradeFeeDenominator"),
    B.u64("pnlNumerator"),
    B.u64("pnlDenominator"),
    B.u64("swapFeeNumerator"),
    B.u64("swapFeeDenominator"),
]);
const AMM_INFO_LAYOUT = B.struct([
    B.u64("status"),
    B.u64("nonce"),
    B.u64("orderNum"),
    B.u64("depth"),
    B.u64("coinDecimals"),
    B.u64("pcDecimals"),
    B.u64("state"),
    B.u64("resetFlag"),
    B.u64("minSize"),
    B.u64("volMaxCutRatio"),
    B.u64("amountWave"),
    B.u64("coinLotSize"),
    B.u64("pcLotSize"),
    B.u64("minPriceMultiplier"),
    B.u64("maxPriceMultiplier"),
    B.u64("sysDecimalValue"),
    B.struct([
        B.u64("minSeparateNumerator"),
        B.u64("minSeparateDenominator"),
        B.u64("tradeFeeNumerator"),
        B.u64("tradeFeeDenominator"),
        B.u64("pnlNumerator"),
        B.u64("pnlDenominator"),
        B.u64("swapFeeNumerator"),
        B.u64("swapFeeDenominator"),
    ], "fees"),
    B.struct([
        B.u64("needTakePnlCoin"),
        B.u64("needTakePnlPc"),
        B.u64("totalPnlPc"),
        B.u64("totalPnlCoin"),
        B.u64("poolOpenTime"),
        B.u64("punishPcAmount"),
        B.u64("punishCoinAmount"),
        B.u64("orderbookToInitTime"),
        B.u128("swapCoinInAmount"),
        B.u128("swapPcOutAmount"),
        B.u64("swapTakePcFee"),
        B.u128("swapPcInAmount"),
        B.u128("swapCoinOutAmount"),
        B.u64("swapTakeCoinFee"),
    ], "outPut"),
    B.publicKey("tokenCoin"),
    B.publicKey("tokenPc"),
    B.publicKey("coinMint"),
    B.publicKey("pcMint"),
    B.publicKey("lpMint"),
    B.publicKey("openOrders"),
    B.publicKey("market"),
    B.publicKey("serumDex"),
    B.publicKey("targetOrders"),
    B.publicKey("withdrawQueue"),
    B.publicKey("tokenTempLp"),
    B.publicKey("ammOwner"),
    B.u64("lpAmount"),
    B.u64("clientOrderId"),
    B.seq(B.u64(), 2, "padding"),
]);
//# sourceMappingURL=accounts.js.map