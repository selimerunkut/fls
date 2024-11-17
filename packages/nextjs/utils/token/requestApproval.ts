import {TokenId} from "~~/models/Token";
import {ethers} from "ethers";
import {BangContractAddress} from "~~/utils/bang";
import {TokenAddress} from "~~/utils/token/index";

export async function requestApproval(amount: string, walletAddress: string, signer: any): Promise<string> {
    // The token contract address (replace with the ERC20 token address)
    const tokenAddress = TokenAddress;

    // Spender address (the address that will be allowed to spend tokens)
    const spenderAddress = BangContractAddress;

    // Set up the contract ABI (only the approve function is required here)
    const abi = [
        "function approve(address spender, uint256 amount) public returns (bool)"
    ];

    // Create a contract instance
    const tokenContract = new ethers.Contract(tokenAddress, abi, signer);

    // Perform the approval transaction
    // Send the transaction
    const tx = await tokenContract.approve(spenderAddress, ethers.parseUnits(amount, 18));
}
