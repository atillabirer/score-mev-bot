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
exports.RaydiumAmmInstructionCoder = void 0;
// @ts-nocheck
const B = __importStar(require("@native-to-anchor/buffer-layout"));
class RaydiumAmmInstructionCoder {
    constructor(_idl) { }
    encode(ixName, ix) {
        switch (ixName) {
            case "initialize": {
                return encodeInitialize(ix);
            }
            case "initialize2": {
                return encodeInitialize2(ix);
            }
            case "monitorStep": {
                return encodeMonitorStep(ix);
            }
            case "deposit": {
                return encodeDeposit(ix);
            }
            case "withdraw": {
                return encodeWithdraw(ix);
            }
            case "migrateToOpenBook": {
                return encodeMigrateToOpenBook(ix);
            }
            case "setParams": {
                return encodeSetParams(ix);
            }
            case "withdrawPnl": {
                return encodeWithdrawPnl(ix);
            }
            case "withdrawSrm": {
                return encodeWithdrawSrm(ix);
            }
            case "swapBaseIn": {
                return encodeSwapBaseIn(ix);
            }
            case "preInitialize": {
                return encodePreInitialize(ix);
            }
            case "swapBaseOut": {
                return encodeSwapBaseOut(ix);
            }
            case "simulateInfo": {
                return encodeSimulateInfo(ix);
            }
            case "adminCancelOrders": {
                return encodeAdminCancelOrders(ix);
            }
            case "createConfigAccount": {
                return encodeCreateConfigAccount(ix);
            }
            case "updateConfigAccount": {
                return encodeUpdateConfigAccount(ix);
            }
            default: {
                throw new Error(`Invalid instruction: ${ixName}`);
            }
        }
    }
    decode(ix) {
        return decodeData(ix);
    }
    encodeState(_ixName, _ix) {
        throw new Error("RaydiumAmm does not have state");
    }
}
exports.RaydiumAmmInstructionCoder = RaydiumAmmInstructionCoder;
function encodeInitialize({ nonce, openTime }) {
    return encodeData({ initialize: { nonce, openTime } }, 1 + 1 + 8);
}
function encodeInitialize2({ nonce, openTime, initPcAmount, initCoinAmount, }) {
    return encodeData({ initialize2: { nonce, openTime, initPcAmount, initCoinAmount } }, 1 + 1 + 8 + 8 + 8);
}
function encodeMonitorStep({ planOrderLimit, placeOrderLimit, cancelOrderLimit, }) {
    return encodeData({ monitorStep: { planOrderLimit, placeOrderLimit, cancelOrderLimit } }, 1 + 2 + 2 + 2);
}
function encodeDeposit({ maxCoinAmount, maxPcAmount, baseSide }) {
    return encodeData({ deposit: { maxCoinAmount, maxPcAmount, baseSide } }, 1 + 8 + 8 + 8);
}
function encodeWithdraw({ amount }) {
    return encodeData({ withdraw: { amount } }, 1 + 8);
}
function encodeMigrateToOpenBook({}) {
    return encodeData({ migrateToOpenBook: {} }, 1);
}
function encodeSetParams({ param, value, newPubkey, fees, lastOrderDistance, needTakeAmounts, }) {
    return encodeData({
        setParams: {
            param,
            value,
            newPubkey,
            fees,
            lastOrderDistance,
            needTakeAmounts,
        },
    }, 1 +
        1 +
        1 +
        (value === null ? 0 : 8) +
        1 +
        (newPubkey === null ? 0 : 32) +
        1 +
        (fees === null ? 0 : 64) +
        1 +
        (lastOrderDistance === null ? 0 : 16) +
        1 +
        (needTakeAmounts === null ? 0 : 16));
}
function encodeWithdrawPnl({}) {
    return encodeData({ withdrawPnl: {} }, 1);
}
function encodeWithdrawSrm({ amount }) {
    return encodeData({ withdrawSrm: { amount } }, 1 + 8);
}
function encodeSwapBaseIn({ amountIn, minimumAmountOut }) {
    return encodeData({ swapBaseIn: { amountIn, minimumAmountOut } }, 1 + 8 + 8);
}
function encodePreInitialize({ nonce }) {
    return encodeData({ preInitialize: { nonce } }, 1 + 1);
}
function encodeSwapBaseOut({ maxAmountIn, amountOut }) {
    return encodeData({ swapBaseOut: { maxAmountIn, amountOut } }, 1 + 8 + 8);
}
function encodeSimulateInfo({ param, swapBaseInValue, swapBaseOutValue, }) {
    return encodeData({ simulateInfo: { param, swapBaseInValue, swapBaseOutValue } }, 1 +
        1 +
        1 +
        (swapBaseInValue === null ? 0 : 16) +
        1 +
        (swapBaseOutValue === null ? 0 : 16));
}
function encodeAdminCancelOrders({ limit }) {
    return encodeData({ adminCancelOrders: { limit } }, 1 + 2);
}
function encodeCreateConfigAccount({}) {
    return encodeData({ createConfigAccount: {} }, 1);
}
function encodeUpdateConfigAccount({ param, owner }) {
    return encodeData({ updateConfigAccount: { param, owner } }, 1 + 1 + 32);
}
const LAYOUT = B.union(B.u8("instruction"));
LAYOUT.addVariant(0, B.struct([B.u8("nonce"), B.u64("openTime")]), "initialize");
LAYOUT.addVariant(1, B.struct([
    B.u8("nonce"),
    B.u64("openTime"),
    B.u64("initPcAmount"),
    B.u64("initCoinAmount"),
]), "initialize2");
LAYOUT.addVariant(2, B.struct([
    B.u16("planOrderLimit"),
    B.u16("placeOrderLimit"),
    B.u16("cancelOrderLimit"),
]), "monitorStep");
LAYOUT.addVariant(3, B.struct([B.u64("maxCoinAmount"), B.u64("maxPcAmount"), B.u64("baseSide")]), "deposit");
LAYOUT.addVariant(4, B.struct([B.u64("amount")]), "withdraw");
LAYOUT.addVariant(5, B.struct([]), "migrateToOpenBook");
LAYOUT.addVariant(6, B.struct([
    B.u8("param"),
    B.option(B.u64(), "value"),
    B.option(B.publicKey(), "newPubkey"),
    B.option(B.struct([
        B.u64("minSeparateNumerator"),
        B.u64("minSeparateDenominator"),
        B.u64("tradeFeeNumerator"),
        B.u64("tradeFeeDenominator"),
        B.u64("pnlNumerator"),
        B.u64("pnlDenominator"),
        B.u64("swapFeeNumerator"),
        B.u64("swapFeeDenominator"),
    ]), "fees"),
    B.option(B.struct([B.u64("lastOrderNumerator"), B.u64("lastOrderDenominator")]), "lastOrderDistance"),
    B.option(B.struct([B.u64("needTakePc"), B.u64("needTakeCoin")]), "needTakeAmounts"),
]), "setParams");
LAYOUT.addVariant(7, B.struct([]), "withdrawPnl");
LAYOUT.addVariant(8, B.struct([B.u64("amount")]), "withdrawSrm");
LAYOUT.addVariant(9, B.struct([B.u64("amountIn"), B.u64("minimumAmountOut")]), "swapBaseIn");
LAYOUT.addVariant(10, B.struct([B.u8("nonce")]), "preInitialize");
LAYOUT.addVariant(11, B.struct([B.u64("maxAmountIn"), B.u64("amountOut")]), "swapBaseOut");
LAYOUT.addVariant(12, B.struct([
    B.u8("param"),
    B.option(B.struct([B.u64("amountIn"), B.u64("minimumAmountOut")]), "swapBaseInValue"),
    B.option(B.struct([B.u64("maxAmountIn"), B.u64("amountOut")]), "swapBaseOutValue"),
]), "simulateInfo");
LAYOUT.addVariant(13, B.struct([B.u16("limit")]), "adminCancelOrders");
LAYOUT.addVariant(14, B.struct([]), "createConfigAccount");
LAYOUT.addVariant(15, B.struct([B.u8("param"), B.publicKey("owner")]), "updateConfigAccount");
function encodeData(ix, span) {
    const b = Buffer.alloc(span);
    LAYOUT.encode(ix, b);
    return b;
}
function decodeData(b) {
    return LAYOUT.decode(b);
}
//# sourceMappingURL=instructions.js.map