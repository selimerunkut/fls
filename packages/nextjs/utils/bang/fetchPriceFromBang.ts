import {TokenId} from "~~/models/Token";
import {ethers} from "ethers";
import {BangContractAddress} from "~~/utils/bang/index";
import {TokenAddress} from "~~/utils/token";

export async function fetchPriceFromBang(tokenId: TokenId, provider: any): Promise<string> {
    // Replace with the deployed contract address
    const contractAddress = BangContractAddress;

    // ABI of the contract
    const contractABI = [
        "function computeAmountOut(address tokenIn, uint256 amountIn) public view returns (uint256)"
    ];

    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Define your token address and amount
    const amountIn = ethers.parseUnits("10", 6); // Replace with the amount you want to test
    const amountOut = await contract.computeAmountOut(TokenAddress, amountIn);
    return ethers.formatUnits(amountOut, 18);
}
