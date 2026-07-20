# EternaX PQ verify precompiles

Required for schemes `100` and `101`. Implemented in eternax-core; this package only *calls* them.

## SLH-DSA-SHAKE-128s — `0x0404`

```solidity
function verify(bytes32 pk, bytes calldata message, bytes calldata signature)
    external view returns (bool);
```

| Field | Size |
|-------|------|
| `pk` | 32 bytes |
| `signature` | 7856 bytes |

Gas (placeholder): ~500_000 base + 16/message byte.

## ML-DSA-65 — `0x0405`

```solidity
function verify(bytes calldata pk, bytes calldata message, bytes calldata signature)
    external view returns (bool);
```

| Field | Size |
|-------|------|
| `pk` | 1952 bytes |
| `signature` | 3309 bytes |

Gas (placeholder): ~150_000 base + size fees.

## Solidity helpers

`contracts/PQVerifier.sol` wraps both with `staticcall` + selector ABI.
