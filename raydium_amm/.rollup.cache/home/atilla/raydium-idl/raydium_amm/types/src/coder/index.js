import { RaydiumAmmAccountsCoder } from "./accounts";
import { RaydiumAmmEventsCoder } from "./events";
import { RaydiumAmmInstructionCoder } from "./instructions";
import { RaydiumAmmStateCoder } from "./state";
import { RaydiumAmmTypesCoder } from "./types";
/**
 * Coder for RaydiumAmm
 */
export class RaydiumAmmCoder {
    constructor(idl) {
        this.accounts = new RaydiumAmmAccountsCoder(idl);
        this.events = new RaydiumAmmEventsCoder(idl);
        this.instruction = new RaydiumAmmInstructionCoder(idl);
        this.state = new RaydiumAmmStateCoder(idl);
        this.types = new RaydiumAmmTypesCoder(idl);
    }
}
//# sourceMappingURL=index.js.map