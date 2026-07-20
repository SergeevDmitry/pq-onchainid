import { keccak_256 } from "@noble/hashes/sha3.js"
import { fromHex } from "./hex.js"

function padLeft(hex: string, bytes: number): string {
  return hex.padStart(bytes * 2, "0")
}

function encodeUint256(v: bigint): string {
  return padLeft(v.toString(16), 32)
}

function encodeAddress(addr: string): string {
  const clean = addr.startsWith("0x") ? addr.slice(2) : addr
  return padLeft(clean.toLowerCase(), 32)
}

function encodeBytes32(v: string | Uint8Array): string {
  if (typeof v === "string") {
    const clean = v.startsWith("0x") ? v.slice(2) : v
    if (clean.length !== 64) throw new Error(`bytes32 must be 32 bytes`)
    return clean.toLowerCase()
  }
  if (v.length !== 32) throw new Error(`bytes32 must be 32 bytes`)
  return Buffer.from(v).toString("hex")
}

function encodeBytes(v: string | Uint8Array): string {
  const bytes =
    typeof v === "string"
      ? Buffer.from(v.startsWith("0x") ? v.slice(2) : v, "hex")
      : Buffer.from(v)
  const len = encodeUint256(BigInt(bytes.length))
  const padded = Buffer.alloc(Math.ceil(bytes.length / 32) * 32 || 0)
  bytes.copy(padded)
  return len + padded.toString("hex")
}

export type AbiValue = bigint | string | boolean | Uint8Array

/** Minimal ABI encoder: uint256, address, bytes32, bytes */
export function abiEncode(types: string[], values: AbiValue[]): Uint8Array {
  const heads: string[] = []
  const tails: string[] = []
  let dynamicOffset = types.length * 32

  for (let i = 0; i < types.length; i++) {
    const t = types[i]
    const v = values[i]
    if (t === "uint256") {
      heads.push(encodeUint256(v as bigint))
    } else if (t === "address") {
      heads.push(encodeAddress(v as string))
    } else if (t === "bytes32") {
      heads.push(encodeBytes32(v as string | Uint8Array))
    } else if (t === "bytes") {
      heads.push(encodeUint256(BigInt(dynamicOffset)))
      const encoded = encodeBytes(v as string | Uint8Array)
      tails.push(encoded)
      dynamicOffset += encoded.length / 2
    } else {
      throw new Error(`unsupported ABI type: ${t}`)
    }
  }

  return fromHex("0x" + heads.join("") + tails.join(""))
}

export function keccak256(data: Uint8Array): Uint8Array {
  return keccak_256(data)
}

export function functionSelector(sig: string): Uint8Array {
  return keccak_256(new TextEncoder().encode(sig)).slice(0, 4)
}

export function encodeFunctionCall(
  sig: string,
  types: string[],
  values: AbiValue[],
): Uint8Array {
  const sel = functionSelector(sig)
  const body = abiEncode(types, values)
  const out = new Uint8Array(sel.length + body.length)
  out.set(sel, 0)
  out.set(body, sel.length)
  return out
}
