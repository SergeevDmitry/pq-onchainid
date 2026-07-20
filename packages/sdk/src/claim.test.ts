import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { randomBytes } from "node:crypto"
import {
  SCHEME,
  SIZES,
  claimDigest,
  claimKeyId,
  buildSlhDsaClaimSig,
  buildMlDsaClaimSig,
  slh_dsa_shake_128s,
  ml_dsa65,
} from "./index.js"

describe("claim digest + PQ sigs", () => {
  const identity = "0x000000000000000000000000000000000000beef"
  const topic = 1n
  const data = new TextEncoder().encode("kyc:passed")

  it("claimDigest is 32 bytes and stable", () => {
    const d1 = claimDigest(identity, topic, data)
    const d2 = claimDigest(identity, topic, data)
    assert.equal(d1.length, 32)
    assert.deepEqual(d1, d2)
  })

  it("builds SLH-DSA claim sig", () => {
    const kp = slh_dsa_shake_128s.keygen(randomBytes(48))
    const { digest, sig } = buildSlhDsaClaimSig(identity, topic, data, kp.publicKey, kp.secretKey)
    assert.equal(digest.length, 32)
    assert.ok(sig.length > 32 + SIZES.SLH_DSA_SIG_LEN)
    const kid = claimKeyId(SCHEME.SLH_DSA_SHAKE_128S, kp.publicKey)
    assert.equal(kid.length, 32)
  })

  it("builds ML-DSA claim sig", () => {
    const kp = ml_dsa65.keygen(randomBytes(32))
    const { digest, sig } = buildMlDsaClaimSig(identity, topic, data, kp.publicKey, kp.secretKey)
    assert.equal(digest.length, 32)
    assert.ok(sig.length > 32 + SIZES.ML_DSA_65_SIG_LEN)
  })
})
