import {ethers} from "ethers";
import {BangContractAddress} from "~~/utils/bang/index";
import {TokenAddress} from "~~/utils/token";

export async function fetchPriceFromBang(fromAmount: number, provider: any): Promise<number> {
    if(fromAmount === 0) return 0;
    // Replace with the deployed contract address
    const contractAddress = BangContractAddress;

    // ABI of the contract
    const contractABI = [
        "function computeAmountOut(address tokenIn, uint256 amountIn) public view returns (uint256)"
    ];

    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Define your token address and amount
    const amountIn = Number(ethers.parseUnits(fromAmount.toString(), 6)); // Replace with the amount you want to test
    const amountOut = Number(await contract.computeAmountOut(TokenAddress, amountIn));
    return amountOut / amountIn;
}
