import * as dotenv from "dotenv";
import * as hre from "hardhat";
import {BangDEX, MyOFT} from "../typechain-types";
import { getNetworkConfig } from "../utils/networkConfig";
dotenv.config();

const DEXES = [
  {
    chain: 84532,
    chainSelector: "10344971235874465080",
    bangDex: "0x9A5589Bfa8758E96D2Cd2245094a489A5725DFDf",
    slotSize: 60 * 60 * 24,
    amount: "500000",
    receiver: "0x814E735c5DD19240c85E2513DD926Bc3a39f7140",
    gasLimit: "3000000",
  },
];
async function main() {
  const { deployer } = await hre.getNamedAccounts();
  const config = getNetworkConfig(hre);

  const bangDex = (await hre.ethers.getContract("BangDEX")) as BangDEX;
  const token = (await hre.ethers.getContract("MyOFT")) as MyOFT;

  let tx;

  const swapAmount = "100"

  console.log("Minting...")
  tx = await token.mint(deployer, swapAmount * 3);
  await tx.wait(1);

  console.log("Approving...")
  tx = await token.approve(bangDex.target, hre.ethers.MaxUint256);
  await tx.wait(1);

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
