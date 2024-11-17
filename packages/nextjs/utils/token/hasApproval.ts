import {TokenId} from "~~/models/Token";
import {ethers} from "ethers";
import {BangContractAddress} from "~~/utils/bang";
import {TokenAddress} from "~~/utils/token/index";

export async function hasApproval(walletAddress: string, provider: any): Promise<number> {
    // Set up the contract ABI (only the allowance function is required here)
    const abi = [
        "function allowance(address owner, address spender) public view returns (uint256)"
    ];

    // Create a contract instance
    const tokenContract = new ethers.Contract(TokenAddress, abi, provider);

    // Check the allowance
    // Call the allowance function
    const allowance = await tokenContract.allowance(walletAddress, BangContractAddress);
    return Number(ethers.formatEther(allowance));
}
