"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaydiumAmmCoder = void 0;
const accounts_1 = require("./accounts");
const events_1 = require("./events");
const instructions_1 = require("./instructions");
const state_1 = require("./state");
const types_1 = require("./types");
/**
 * Coder for RaydiumAmm
 */
class RaydiumAmmCoder {
    constructor(idl) {
        this.accounts = new accounts_1.RaydiumAmmAccountsCoder(idl);
        this.events = new events_1.RaydiumAmmEventsCoder(idl);
        this.instruction = new instructions_1.RaydiumAmmInstructionCoder(idl);
        this.state = new state_1.RaydiumAmmStateCoder(idl);
        this.types = new types_1.RaydiumAmmTypesCoder(idl);
    }
}
exports.RaydiumAmmCoder = RaydiumAmmCoder;
//# sourceMappingURL=index.js.map