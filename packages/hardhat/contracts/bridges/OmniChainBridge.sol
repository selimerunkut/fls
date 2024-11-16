// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { OAppSender, OAppCore } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";
import { OFT } from "@layerzerolabs/oft-evm/contracts/OFT.sol";
import { SendParam } from "@layerzerolabs/oft-evm/contracts/interfaces/IOFT.sol";
import { MessagingFee } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroEndpointV2.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IBridge } from "../interfaces/IBridge.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract OmniChainBridge is IBridge, OAppSender {
  constructor(address _endpoint, address _owner) OAppCore(_endpoint, _owner) Ownable(_owner) {}

  function callCrossChain(uint64 chainId, address target, bytes calldata data) public {
    _lzSend(
      uint32(chainId),
      abi.encode(target, data),
      "",
      // Fee in native gas and ZRO token.
      // TODO: Don't send all the balance and calculate the fee
      MessagingFee(address(this).balance, 0),
      // Refund address in case of failed source message.
      payable(msg.sender)
    );
  }

  function transferToken(IERC20Metadata token, uint64 chainId, address target, uint256 amount) public {
    // TODO: Check that it's an omni token
    OFT omniToken = OFT(address(token));

    omniToken.send(
      SendParam({
        dstEid: uint32(chainId),
        to: bytes32(uint256(uint160(target))),
        // TODO: Should we check the decimals
        amountLD: amount,
        // TODO: What is the min
        minAmountLD: amount,
        // TODO: Check
        extraOptions: "", // Additional options supplied by the caller to be used in the LayerZero message.
        composeMsg: "", // The composed message for the send() operation.
        oftCmd: "" // The OFT
      }),
      // TODO: Change
      MessagingFee(address(this).balance, 0),
      // Refund address in case of failed source message.
      payable(msg.sender)
    );
  }

  function transferTokenAndData(
    IERC20Metadata token,
    uint64 chainId,
    address target,
    uint256 amount,
    bytes calldata data
  ) public {
    // TODO: Check that it's an omni token
    OFT omniToken = OFT(address(token));

    omniToken.send(
      SendParam({
        dstEid: uint32(chainId),
        to: bytes32(uint256(uint160(target))),
        // TODO: Should we check the decimals
        amountLD: amount,
        // TODO: What is the min
        minAmountLD: amount,
        // TODO: Check
        extraOptions: "", // Additional options supplied by the caller to be used in the LayerZero message.
        composeMsg: "", // The composed message for the send() operation.
        oftCmd: "" // The OFT
      }),
      // TODO: Change
      MessagingFee(address(this).balance, 0),
      // Refund address in case of failed source message.
      payable(msg.sender)
    );
  }
}
