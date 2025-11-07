// src/utils.ts
export function nowSec(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

export function toJSONBigInt<T extends Record<string, any>>(obj: T) {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

