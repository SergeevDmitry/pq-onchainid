// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SignatureSchemes} from "./SignatureSchemes.sol";

/// @dev Selector-based ABI for the SLH-DSA precompile at 0x0404.
interface ISLHDSA {
    function verify(bytes32 pk, bytes calldata message, bytes calldata signature)
        external
        view
        returns (bool);
}

/// @dev Selector-based ABI for the ML-DSA-65 precompile at 0x0405.
interface IMLDSA {
    function verify(bytes calldata pk, bytes calldata message, bytes calldata signature)
        external
        view
        returns (bool);
}

/// @title Thin wrappers around EternaX PQ verify precompiles
/// @dev Both SLH-DSA and ML-DSA forward to native host functions.
library PQVerifier {
    /// @notice Verify SLH-DSA-SHAKE-128s over `message` with 32-byte public key.
    function verifySlhDsa(bytes32 pk, bytes memory message, bytes memory signature)
        internal
        view
        returns (bool)
    {
        require(signature.length == SignatureSchemes.SLH_DSA_SIG_LEN, "slh-dsa: bad sig len");

        (bool ok, bytes memory ret) = SignatureSchemes.SLH_DSA_VERIFY.staticcall(
            abi.encodeCall(ISLHDSA.verify, (pk, message, signature))
        );
        if (!ok || ret.length < 32) {
            return false;
        }
        return abi.decode(ret, (bool));
    }

    /// @notice Verify ML-DSA-65 over `message`.
    function verifyMlDsa(bytes memory pk, bytes memory message, bytes memory signature)
        internal
        view
        returns (bool)
    {
        require(pk.length == SignatureSchemes.ML_DSA_65_PK_LEN, "ml-dsa: bad pk len");
        require(signature.length == SignatureSchemes.ML_DSA_65_SIG_LEN, "ml-dsa: bad sig len");

        (bool ok, bytes memory ret) = SignatureSchemes.ML_DSA_VERIFY.staticcall(
            abi.encodeCall(IMLDSA.verify, (pk, message, signature))
        );
        if (!ok || ret.length < 32) {
            return false;
        }
        return abi.decode(ret, (bool));
    }

    /// @notice ECDSA recover of Ethereum signed message over `digest` (32-byte hash).
    /// @dev `signature` is 65 bytes: r || s || v
    function recoverEcdsa(bytes32 digest, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "ecdsa: bad sig len");

        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly ("memory-safe") {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        if (v < 27) {
            v += 27;
        }

        bytes32 ethHash =
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", digest));
        return ecrecover(ethHash, v, r, s);
    }
}
