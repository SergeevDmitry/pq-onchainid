// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Signature scheme IDs and EternaX PQ precompile addresses
/// @dev Scheme 1 matches ERC-735 ECDSA. 100/101 are EternaX PQ conventions.
library SignatureSchemes {
    uint256 internal constant ECDSA = 1;
    uint256 internal constant SLH_DSA_SHAKE_128S = 100;
    uint256 internal constant ML_DSA_65 = 101;

    /// @dev EternaX Pluto / compatible EVM: after Curve25519 at 0x0402 / 0x0403.
    address internal constant SLH_DSA_VERIFY = address(0x0404);
    address internal constant ML_DSA_VERIFY = address(0x0405);

    uint256 internal constant SLH_DSA_PK_LEN = 32;
    uint256 internal constant SLH_DSA_SIG_LEN = 7856;

    /// @dev FIPS 204 ML-DSA-65 sizes; adjust if parameter set changes at precompile land.
    uint256 internal constant ML_DSA_65_PK_LEN = 1952;
    uint256 internal constant ML_DSA_65_SIG_LEN = 3309;

    function keyId(uint256 scheme, bytes memory pubkey) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(scheme, pubkey));
    }
}
