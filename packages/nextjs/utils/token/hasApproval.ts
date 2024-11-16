import {TokenId} from "~~/models/Token";
import {ethers} from "ethers";
import {BangContractAddress} from "~~/utils/bang";
import {TokenAddress} from "~~/utils/token/index";

export async function requestApproval(walletAddress: string, provider: any): Promise<string> {
    // Set up the contract ABI (only the allowance function is required here)
    const abi = [
        "function allowance(address owner, address spender) public view returns (uint256)"
    ];

    // Create a contract instance
    const tokenContract = new ethers.Contract(TokenAddress, abi, provider);

    // Check the allowance
    // Call the allowance function
    const allowance = await tokenContract.allowance(walletAddress, BangContractAddress);

    // Convert the allowance from BigNumber to a human-readable format
    const allowanceFormatted = ethers.formatUnits(allowance, 18); // assuming 18 decimals
    alert(`Allowance for spender ${BangContractAddress}: ${allowanceFormatted} tokens`);
}
