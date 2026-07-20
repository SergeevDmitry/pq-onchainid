// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title ONCHAINID-compatible ClaimIssuer + PQ key management
/// @dev `isClaimValid` keeps the stock ClaimIssuer arity; `identity` is the
///      ONCHAINID / ERC-734 contract address whose claim is being checked.
interface IPQClaimIssuer {
    /// @notice ERC-734 key purpose for claim signing (ONCHAINID CLAIM = 3).
    function CLAIM_PURPOSE() external view returns (uint256);

    /// @notice Validate a claim signature for `identity` / `topic` / `data`.
    /// @dev PQ schemes encode scheme + pubkey + raw signature inside `sig`
    ///      (see PQClaimIssuer encoding). ECDSA uses a bare 65-byte signature.
    function isClaimValid(
        address identity,
        uint256 topic,
        bytes calldata sig,
        bytes calldata data
    ) external view returns (bool);

    /// @notice Register a claim-signing public key for a scheme.
    function addClaimKey(uint256 scheme, bytes calldata pubkey) external;

    /// @notice Remove a claim-signing public key.
    function revokeClaimKey(uint256 scheme, bytes calldata pubkey) external;

    /// @notice True if `keyId = keccak256(scheme || pubkey)` is an active CLAIM key.
    function isClaimKey(bytes32 keyId) external view returns (bool);

    /// @notice Revoke a specific claim signature (ONCHAINID-style revocation).
    function revokeClaimBySignature(bytes calldata sig) external;

    function isClaimRevoked(bytes calldata sig) external view returns (bool);

    event ClaimKeyAdded(uint256 indexed scheme, bytes32 indexed keyId, bytes pubkey);
    event ClaimKeyRevoked(uint256 indexed scheme, bytes32 indexed keyId);
    event ClaimRevoked(bytes32 indexed sigHash);
}
