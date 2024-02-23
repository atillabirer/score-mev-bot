/// <reference types="node" />
import { Idl, StateCoder } from "@coral-xyz/anchor";
export declare class RaydiumAmmStateCoder implements StateCoder {
    constructor(_idl: Idl);
    encode<T = any>(_name: string, _account: T): Promise<Buffer>;
    decode<T = any>(_ix: Buffer): T;
}
//# sourceMappingURL=state.d.ts.map