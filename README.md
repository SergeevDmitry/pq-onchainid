# PQ-ONCHAINID

Post-quantum **ClaimIssuer** module for [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643) [ONCHAINID](https://github.com/onchain-id/solidity) compliance flows.

EternaX is an EVM-compatible post-quantum-native blockchain. This package replaces ECDSA `ecrecover`-based claim verification with **SLH-DSA** and **ML-DSA** while keeping the same ERC-3643 surfaces: claim topics, trusted issuers, identity registry, and compliance gating.

Product context: [Post-Quantum Stablecoins & Institutional Tokenization](https://eternax.ai/post-quantum-stablecoins-and-tokenization.html).

## What this is

This repo includes:

- `PQClaimIssuer` scheme-dispatch `isClaimValid` for FIPS 204/205 post-quantum signatures
- Precompile ABIs for EternaX (`0x0404` / `0x0405`) 
- TypeScript SDK to hash + sign PQ claims 

Compatible with stock ERC-3643 Token + registries. Register this ClaimIssuer as a trusted issuer and issue claims with PQ signatures.

## Architecture

```
Token / Compliance                 ← unchanged (stock ERC-3643)
        │
IdentityRegistry.isVerified        ← unchanged interface
        │
TrustedIssuers + ClaimTopics       ← unchanged concepts
        │
PQClaimIssuer.isClaimValid         ← this module
        │
   ┌────┼────────┐
 ECDSA  SLH-DSA  ML-DSA
 (0x01) (0x0404) (0x0405)   ← EternaX EVM precompiles → native host
```

## Signature schemes

| `scheme` | Algorithm | Wire `sig` |
|----------|-----------|------------|
| `1` | ECDSA secp256k1 (ERC-735) | legacy 65-byte `r\|\|s\|\|v` |
| `100` | SLH-DSA-SHAKE-128s (FIPS 205) | `abi.encode(scheme, pubkey, rawSig)` |
| `101` | ML-DSA-65 (FIPS 204) | `abi.encode(scheme, pubkey, rawSig)` |

Claim digest (all schemes):

```solidity
keccak256(abi.encode(identity, topic, data))
```

## Repository layout

```
contracts/                 Solidity sources
deployments/pluto/         Chain addresses (precompiles + future issuer deploys)
docs/                      Architecture + ERC-3643 integration
packages/sdk/              @eternax/pq-onchainid-sdk — claim digest + PQ signing
scripts/                   Helpers
```

## Quick start

```bash
npm install
npm run compile

# SDK (claim digest + SLH/ML-DSA claim signatures)
npm run build -w @eternax/pq-onchainid-sdk
```

```ts
import {
  SCHEME,
  claimDigest,
  signSlhDsaClaim,
  encodePqClaimSig,
} from "@eternax/pq-onchainid-sdk";

const data = new TextEncoder().encode("kyc:passed");
const digest = claimDigest(identity, 1n, data);
const { publicKey, secretKey } = /* your issuer SLH-DSA keypair */;
const rawSig = signSlhDsaClaim(digest, secretKey);
const sig = encodePqClaimSig(SCHEME.SLH_DSA_SHAKE_128S, publicKey, rawSig);
// pass sig to identity.addClaim(...) / isClaimValid(...)
```

## Chain requirements

PQ verification calls EternaX precompiles (not Solidity crypto):

| Address | ABI |
|---------|-----|
| `0x0404` | `verify(bytes32 pk, bytes message, bytes signature) → bool` |
| `0x0405` | `verify(bytes pk, bytes message, bytes signature) → bool` |

These ship in EternaX core protocol, currently available on EteraX Pluto testnet. On chains without those precompiles, PQ scheme verification will fail.

Pluto testnet RPC: `https://pluto-testnet.eternax.ai/rpc0` (see `deployments/pluto/`).

## ERC-3643 integration (issuer checklist)

1. Deploy stock ERC-3643 Token, Identity Registry, Claim Topics, Trusted Issuers, Compliance (Tokeny / ERC-3643 suite or equivalent).
2. Deploy `PQClaimIssuer` on an EternaX-compatible EVM.
3. `addClaimKey(100, slhPk)` and/or `addClaimKey(101, mlPk)` for issuer keys.
4. Register the ClaimIssuer in the Trusted Issuers Registry for required topics.
5. Issue claims signed under scheme `100` / `101`; investors hold ONCHAINID identities as usual.
6. Optional transition: keep scheme `1` (ECDSA) enabled, re-issue claims under PQ, then disable ECDSA.

Details: [docs/erc-3643-integration.md](docs/erc-3643-integration.md).

## License

MIT — contracts and SDK in this repository.

PQ-ONCHAINID is an ERC-3643–compatible module. Pair it with the official [ERC-3643](https://github.com/ERC-3643/ERC-3643) and [ONCHAINID](https://github.com/onchain-id/solidity) packages for Token, identity, and registry contracts.

## Related

- [pluto-testnet-tools](https://github.com/eternax-ai/pluto-testnet-tools) dual-sig deploy / integration tests
- [ERC-3643](https://github.com/ERC-3643/ERC-3643)
- [ONCHAINID](https://github.com/onchain-id/solidity)
