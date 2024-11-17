import * as dotenv from "dotenv";
import * as hre from "hardhat";
import {BangDEX, MyOFT} from "../typechain-types";
import { getNetworkConfig } from "../utils/networkConfig";
dotenv.config();

async function main() {
  const { deployer } = await hre.getNamedAccounts();
  const config = getNetworkConfig(hre);

  const bangDex = (await hre.ethers.getContract("BangDEX")) as BangDEX;
  const token = (await hre.ethers.getContract("MyOFT")) as MyOFT;

  let tx;

  const swapAmount = "1000000000000000000"

  console.log("Minting...")
  tx = await token.mint(deployer, swapAmount);
  await tx.wait(1);

  console.log("Approving...")
  tx = await token.approve(bangDex.target, hre.ethers.MaxUint256);
  await tx.wait(1);

  console.log(await bangDex.computeAmountOut(token.target, swapAmount));

  console.log("Swapping...")
  tx = await bangDex.exactInputSingle({
    tokenIn: token.target,
    tokenOut: config.payToken,
    amountIn: swapAmount,
    amountOutMinimum: 0,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    recipient: deployer,
    fee: 123,
    sqrtPriceLimitX96: 123,
  }, {gasLimit: 800000});
  await tx.wait(1);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
