// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { ITransferBridge } from "../interfaces/ITransferBridge.sol";
import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

interface IStaker {
  function stake(address beneficiary, uint256 amount) external;

  function redeem() external;
}

/**
 * @title CCIPBridge
 * @notice Implementation of the bridge using CCIP Chainlink protocol.
 */
contract CCIPBridge is AccessControl, ITransferBridge {
  using SafeERC20 for IERC20Metadata;

  bytes32 public constant CHAIN_ADMIN_ROLE = keccak256("CHAIN_ADMIN_ROLE");

  // Code Adapted following docs in https://docs.chain.link/ccip/tutorials/transfer-tokens-from-contract

  // Used when the receiver address is 0 for a given destination chain.
  error NoReceiverOnDestinationChain(uint64 destinationChainSelector);

  error NoGasLimitOnDestinationChain(uint64 destinationChainSelector); // Used when the gas limit is 0.
  error AmountIsZero(); // Used if the amount to transfer is 0.
  // Used to make sure contract has enough balance to cover the fees.
  error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);

  // Event emitted when a message is sent to another chain.
  event MessageSent(
    bytes32 indexed messageId, // The unique ID of the CCIP message.
    uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
    address indexed receiver, // The address of the receiver contract on the destination chain.
    address beneficiary, // The beneficiary of the staked tokens on the destination chain.
    address token, // The token address that was transferred.
    uint256 tokenAmount, // The token amount that was transferred.
    address feeToken, // the token address used to pay CCIP fees.
    uint256 fees // The fees paid for sending the message.
  );

  IRouterClient public immutable ccipRouter;
  IERC20Metadata public immutable linkToken;
  // IERC20Metadata private immutable i_usdcTokena

  struct ChainConfig {
    address receiver;
    uint64 chainSelector;
    uint32 gasLimit;
  }

  mapping(uint64 => ChainConfig) public chains;

  error NotImplemented();

  constructor(IRouterClient ccipRouter_, IERC20Metadata linkToken_, address admin) {
    ccipRouter = ccipRouter_;
    linkToken = linkToken_;
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
  }

  function setTargetChain(
    uint64 chainId,
    uint64 chainSelector,
    address receiver,
    uint256 gasLimit_
  ) external onlyRole(CHAIN_ADMIN_ROLE) {
    // To disable a chain send receiver = address(0) and the other values != 0
    chains[chainId].receiver = receiver;
    chains[chainId].chainSelector = chainSelector;
    require(gasLimit_ != 0, NoGasLimitOnDestinationChain(chainId));
    require(chainSelector != 0, NoGasLimitOnDestinationChain(chainSelector)); // TODO: correct error
    chains[chainId].gasLimit = uint32(gasLimit_); // TODO: safeCast
    // TODO emit event
  }

  /// @notice Construct a CCIP message.
  /// @dev This function will create an EVM2AnyMessage struct with all the necessary information for tokens transfer.
  /// @param _receiver The address of the receiver.
  /// @param _token The token to be transferred.
  /// @param _amount The amount of the token to be transferred.
  /// @param _feeTokenAddress The address of the token used for fees. Set address(0) for native gas.
  /// @return Client.EVM2AnyMessage Returns an EVM2AnyMessage struct which contains information for sending a CCIP message.
  function _buildCCIPMessage(
    address _receiver,
    address _token,
    uint256 _amount,
    address _feeTokenAddress
  ) private pure returns (Client.EVM2AnyMessage memory) {
    // Set the token amounts
    Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
    tokenAmounts[0] = Client.EVMTokenAmount({ token: _token, amount: _amount });

    // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
    return
      Client.EVM2AnyMessage({
        receiver: abi.encode(_receiver), // ABI-encoded receiver address
        data: "", // No data
        tokenAmounts: tokenAmounts, // The amount and type of token being transferred
        extraArgs: Client._argsToBytes(
          // Additional arguments, setting gas limit and allowing out-of-order execution.
          // Best Practice: For simplicity, the values are hardcoded. It is advisable to use a more dynamic approach
          // where you set the extra arguments off-chain. This allows adaptation depending on the lanes, messages,
          // and ensures compatibility with future CCIP upgrades. Read more about it here: https://docs.chain.link/ccip/best-practices#using-extraargs
          Client.EVMExtraArgsV2({
            gasLimit: 0, // Gas limit for the callback on the destination chain
            allowOutOfOrderExecution: true // Allows the message to be executed out of order relative to other messages from the same sender
          })
        ),
        // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
        feeToken: _feeTokenAddress
      });
  }

  function transferToken(IERC20Metadata token, uint64 chainId, address target, uint256 amount) external {
    ChainConfig storage config = chains[chainId];

    require(config.receiver != address(0), NoReceiverOnDestinationChain(chainId));
    // No need to check gas limit since already checked in setTargetChain
    if (amount == 0) revert AmountIsZero();

    // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
    Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
      config.receiver,
      address(token),
      amount,
      address(linkToken)
    );

    // Get the fee required to send the CCIP message
    uint256 fees = ccipRouter.getFee(config.chainSelector, evm2AnyMessage);

    if (fees > linkToken.balanceOf(address(this))) revert NotEnoughBalance(linkToken.balanceOf(address(this)), fees);

    // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
    linkToken.approve(address(ccipRouter), fees);

    token.safeTransferFrom(msg.sender, address(this), amount);
    // approve the Router to spend usdc tokens on contract's behalf. It will spend the amount of the given token
    token.approve(address(ccipRouter), amount);

    // Send the message through the router and store the returned message ID
    bytes32 messageId = ccipRouter.ccipSend(config.chainSelector, evm2AnyMessage);

    // Emit an event with message details
    emit MessageSent(
      messageId,
      config.chainSelector,
      config.receiver,
      target,
      address(token),
      amount,
      address(linkToken),
      fees
    );
  }

  function transferTokenAndData(IERC20Metadata, uint64, address, uint256, bytes calldata) external pure {
    revert NotImplemented();
  }
}
