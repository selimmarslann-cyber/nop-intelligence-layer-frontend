// src/utils.ts
export function nowSec() {
    return BigInt(Math.floor(Date.now() / 1000));
}
export function toJSONBigInt(obj) {
    return JSON.parse(JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
}
//# sourceMappingURL=utils.js.map