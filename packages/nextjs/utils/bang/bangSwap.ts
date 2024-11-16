import {TokenId} from "~~/models/Token";
import {ethers} from "ethers";
import {BangContractAddress} from "~~/utils/bang/index";
import {PayTokenAddress, TokenAddress} from "~~/utils/token";

export async function bangSwap(amountIn: number, address: string, signer: any): Promise<string> {
    // Set up the ABI for the contract with the exactInputSingle function
    const abi = [
        "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)"
    ];

    // Create a contract instance
    const contract = new ethers.Contract(BangContractAddress, abi, signer);

    // Set up the parameters for ExactInputSingleParams
    const params = {
        tokenIn: TokenAddress, // Address of the token you are swapping from
        tokenOut: PayTokenAddress, // Address of the token you are swapping to
        fee: 123, // Fee tier (typically 500, 3000, or 10000 for Uniswap V3)
        recipient: address, // Address that will receive the output token
        deadline: Math.floor(Date.now() / 1000) + 3600, // Deadline in Unix timestamp (1 hour from now)
        amountIn: '100',
        amountOutMinimum: 0, // Minimum amount of tokenOut to receive (e.g., 0.5 tokenOut with 18 decimals)
        sqrtPriceLimitX96: 123 // Price limit (optional, set to 0 for no limit)
    };

    // Send the transaction
    // Call the exactInputSingle function
    const tx = await contract.exactInputSingle(params, {
        gasLimit: 800000 // Set the gas limit for the transaction
    });

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    alert(`Swap executed successfully! Transaction hash: ${receipt.hash}`);
}
