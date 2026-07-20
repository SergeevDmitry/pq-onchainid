# Architecture

## Problem

Stock ONCHAINID `ClaimIssuer.isClaimValid` recovers the signer with `ecrecover` (ECDSA only). Under a cryptographically relevant quantum computer, forged issuer signatures bypass ERC-3643 compliance gates without changing Token or Compliance logic.

## Solution

Keep ERC-3643 / ONCHAINID **interfaces and workflow**. Replace the verification primitive inside the ClaimIssuer with scheme dispatch:

- Scheme `1` — ECDSA (transition / compat)
- Scheme `100` — SLH-DSA-SHAKE-128s via precompile `0x0404`
- Scheme `101` — ML-DSA-65 via precompile `0x0405`

Issuer claim keys are `(scheme, pubkey)` identified by `keccak256(abi.encodePacked(scheme, pubkey))`, not ECDSA address recovery alone.

## Trust boundary

| Layer | Trust |
|-------|--------|
| Token / Compliance | Unchanged; ask `isVerified` |
| Identity Registry | Calls trusted issuer `isClaimValid` |
| PQClaimIssuer | Enforces scheme, key registry, revocation |
| Precompile / host | Native FIPS verify (`fips205` / `fips204`) |

Account authentication (e.g. dual-sig SLH-DSA wallets on EternaX) is independent of claim issuer keys.
