// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CoprocessorConfig} from "@fhevm/solidity/lib/Impl.sol";

/// @notice Default fhEVM coprocessor addresses — update these when deploying
///         to a specific testnet/mainnet with fhEVM support.
library CoprocessorSetup {
    function defaultConfig() internal pure returns (CoprocessorConfig memory) {
        return CoprocessorConfig({
            ACLAddress: address(0x0000000000000000000000000000000000000066),
            CoprocessorAddress: address(0x0000000000000000000000000000000000000067),
            KMSVerifierAddress: address(0x0000000000000000000000000000000000000068)
        });
    }
}
