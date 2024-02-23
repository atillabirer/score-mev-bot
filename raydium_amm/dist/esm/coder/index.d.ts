import { Idl, Coder } from "@coral-xyz/anchor";
import { RaydiumAmmAccountsCoder } from "./accounts";
import { RaydiumAmmEventsCoder } from "./events";
import { RaydiumAmmInstructionCoder } from "./instructions";
import { RaydiumAmmStateCoder } from "./state";
import { RaydiumAmmTypesCoder } from "./types";
/**
 * Coder for RaydiumAmm
 */
export declare class RaydiumAmmCoder implements Coder {
    readonly accounts: RaydiumAmmAccountsCoder;
    readonly events: RaydiumAmmEventsCoder;
    readonly instruction: RaydiumAmmInstructionCoder;
    readonly state: RaydiumAmmStateCoder;
    readonly types: RaydiumAmmTypesCoder;
    constructor(idl: Idl);
}
//# sourceMappingURL=index.d.ts.map