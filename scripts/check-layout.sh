#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
test -f "$ROOT/contracts/PQClaimIssuer.sol"
test -f "$ROOT/packages/sdk/src/index.ts"
test -f "$ROOT/deployments/pluto/precompiles.json"
echo "layout ok: $ROOT"
