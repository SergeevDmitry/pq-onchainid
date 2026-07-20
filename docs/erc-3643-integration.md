# ERC-3643 integration guide

## Goal

Issue regulated tokens with stock ERC-3643 modules while claim attestations are PQ-verifiable.

## Component from this package

- `PQClaimIssuer` — replace (or dual-run beside) ECDSA ClaimIssuer

## Components to use from ERC-3643
- Token (ERC-3643)
- Identity Registry
- Trusted Issuers Registry
- Claim Topics Registry
- Compliance modules
- Investor ONCHAINID / ERC-734 identity contracts (stock or equivalent)


## Deployment sequence

1. Deploy ERC-3643 suite as usual.
2. Deploy `PQClaimIssuer` (this repo).
3. Owner calls `addClaimKey(scheme, pubkey)` for each issuer PQ key.
4. Register `PQClaimIssuer` address in Trusted Issuers Registry for required claim topics.
5. For each investor identity, `addClaim(topic, scheme, issuer, signature, data, uri)` with PQ `signature` encoding (see README).
6. Transfers succeed when Identity Registry sees valid claims from trusted issuers — same as today.

## Claim signature encoding (PQ)

```text
sig = abi.encode(uint256 scheme, bytes pubkey, bytes rawSig)
```

`rawSig` is SLH-DSA or ML-DSA over `keccak256(abi.encode(identity, topic, data))` (32-byte digest as the message).

## Dual transition

1. Enable schemes `1`, `100`, `101` on `PQClaimIssuer`.
2. Re-issue live claims under `100` / `101`.
3. `setSchemeEnabled(1, false)` when ECDSA claims are retired.

## Scope

This package only replaces claim verification. Keep Token, Identity Registry, Trusted Issuers, Claim Topics, and Compliance from your usual ERC-3643 / ONCHAINID deployment path.
