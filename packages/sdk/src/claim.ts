import { slh_dsa_shake_128s } from "@noble/post-quantum/slh-dsa.js"
import { ml_dsa65 } from "@noble/post-quantum/ml-dsa.js"
import { abiEncode, keccak256 } from "./abi.js"
import { SCHEME, SIZES } from "./schemes.js"

/**
 * Canonical claim digest used by PQClaimIssuer for all schemes:
 * keccak256(abi.encode(identity, topic, data))
 */
export function claimDigest(
  identity: string,
  topic: bigint,
  data: Uint8Array,
): Uint8Array {
  return keccak256(abiEncode(["address", "uint256", "bytes"], [identity, topic, data]))
}

/** keyId = keccak256(abi.encodePacked(uint256 scheme, bytes pubkey)) */
export function claimKeyId(scheme: bigint, pubkey: Uint8Array): Uint8Array {
  const packed = new Uint8Array(32 + pubkey.length)
  packed.set(abiEncode(["uint256"], [scheme]), 0)
  packed.set(pubkey, 32)
  return keccak256(packed)
}

/**
 * PQ wire format for isClaimValid / addClaim signature field:
 * abi.encode(uint256 scheme, bytes pubkey, bytes rawSig)
 */
export function encodePqClaimSig(
  scheme: bigint,
  pubkey: Uint8Array,
  rawSig: Uint8Array,
): Uint8Array {
  return abiEncode(["uint256", "bytes", "bytes"], [scheme, pubkey, rawSig])
}

/** Sign claim digest with SLH-DSA-SHAKE-128s (message = 32-byte digest). */
export function signSlhDsaClaim(digest: Uint8Array, secretKey: Uint8Array): Uint8Array {
  if (digest.length !== 32) throw new Error("claim digest must be 32 bytes")
  const sig = slh_dsa_shake_128s.sign(digest, secretKey)
  if (sig.length !== SIZES.SLH_DSA_SIG_LEN) {
    throw new Error(`unexpected SLH-DSA sig length ${sig.length}`)
  }
  return sig
}

/** Sign claim digest with ML-DSA-65. */
export function signMlDsaClaim(digest: Uint8Array, secretKey: Uint8Array): Uint8Array {
  if (digest.length !== 32) throw new Error("claim digest must be 32 bytes")
  const sig = ml_dsa65.sign(digest, secretKey)
  if (sig.length !== SIZES.ML_DSA_65_SIG_LEN) {
    throw new Error(`unexpected ML-DSA sig length ${sig.length}`)
  }
  return sig
}

/** Build a full PQ claim signature blob for scheme 100. */
export function buildSlhDsaClaimSig(
  identity: string,
  topic: bigint,
  data: Uint8Array,
  publicKey: Uint8Array,
  secretKey: Uint8Array,
): { digest: Uint8Array; sig: Uint8Array } {
  if (publicKey.length !== SIZES.SLH_DSA_PK_LEN) {
    throw new Error(`SLH-DSA pk must be ${SIZES.SLH_DSA_PK_LEN} bytes`)
  }
  const digest = claimDigest(identity, topic, data)
  const rawSig = signSlhDsaClaim(digest, secretKey)
  return {
    digest,
    sig: encodePqClaimSig(SCHEME.SLH_DSA_SHAKE_128S, publicKey, rawSig),
  }
}

/** Build a full PQ claim signature blob for scheme 101. */
export function buildMlDsaClaimSig(
  identity: string,
  topic: bigint,
  data: Uint8Array,
  publicKey: Uint8Array,
  secretKey: Uint8Array,
): { digest: Uint8Array; sig: Uint8Array } {
  if (publicKey.length !== SIZES.ML_DSA_65_PK_LEN) {
    throw new Error(`ML-DSA pk must be ${SIZES.ML_DSA_65_PK_LEN} bytes`)
  }
  const digest = claimDigest(identity, topic, data)
  const rawSig = signMlDsaClaim(digest, secretKey)
  return {
    digest,
    sig: encodePqClaimSig(SCHEME.ML_DSA_65, publicKey, rawSig),
  }
}

export { slh_dsa_shake_128s, ml_dsa65 }
