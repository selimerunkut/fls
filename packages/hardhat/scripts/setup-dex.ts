import * as dotenv from "dotenv";
import * as hre from "hardhat";
import {
  BangDEX,
  CrossChainLiquidator, EOALiquidator, HLCCIPBridge, MyOFT,
} from "../typechain-types";
import { getNetworkConfig } from "../utils/networkConfig";
dotenv.config();

async function main() {
  const { deployer } = await hre.getNamedAccounts();

  const config = getNetworkConfig(hre);

  const bangDex = (await hre.ethers.getContract("BangDEX")) as BangDEX;
  const crossChainLiquidator = (await hre.ethers.getContract("CrossChainLiquidator")) as CrossChainLiquidator;
  const hlCcipBridge = (await hre.ethers.getContract("HLCCIPBridge")) as HLCCIPBridge;
  const eoaLiquidator = (await hre.ethers.getContract("EOALiquidator")) as EOALiquidator;
  const token = (await hre.ethers.getContract("MyOFT")) as MyOFT;

  let tx;
  //
  // console.log("Adding BangDex roles to deployer");
  // const roles = await Promise.all([
  //   bangDex.RISK_HUB_ROLE(),
  //   bangDex.ORACLE_ADMIN_ROLE(),
  //   bangDex.SET_SLOT_SIZE_ROLE(),
  //   bangDex.LIQUIDATOR_ADMIN_ROLE(),
  //   bangDex.MARKET_ADMIN_ROLE(),
  // ]);
  // for (const role of roles) {
  //   tx = await bangDex.grantRole(role, deployer);
  //   await tx.wait(1);
  // }
  // console.log("Finish adding BangDex roles to deployer");
  //
  // console.log("Adding CrossChainLiquidator roles to the dex");
  // tx = await crossChainLiquidator.grantRole(
  //   await crossChainLiquidator.LIQUIDATOR_ADMIN_ROLE(),
  //   bangDex.target
  // );
  // tx.wait(1);
  // console.log("Finish adding CrossChainLiquidator roles to dex");

  console.log("Adding Liquidator");
  tx = await bangDex.setLiquidator(token.target, eoaLiquidator.target);
  await tx.wait(1);

  // console.log("Sending pay tokens...");
  // const payToken = await hre.ethers.getContractAt("ERC20", config.payToken);
  // tx = await payToken.transfer(bangDex.target, "1000000");
  // await tx.wait(1);
  //
  // console.log("Adding Market");
  // tx = await bangDex.setMarketParameters(
  //   token.target,
  //   await bangDex.slotSize(),
  //   "20043", // TODAY
  //   "980000000000000000", // 0.98
  //   "80000000000000000", // 0.08
  //   "100000000000000000000", // 100
  //   "10", // 10 cents
  // )
  // await tx.wait(1);
  //
  // console.log("Adding Market");
  // tx = await bangDex.setMarketParameters(
  //   token.target,
  //   await bangDex.slotSize(),
  //   "20044", // TOMORROW
  //   "980000000000000000", // 0.98
  //   "80000000000000000", // 0.9
  //   "100000000000000000000", // 100
  //   "10", // 10 cents
  // )
  // await tx.wait(1);
  //
  // const [sender] = await ethers.getSigners(); // Get the first signer from the Hardhat accounts
  // tx = await sender.sendTransaction({to: hlCcipBridge.target, value: "30000000000000000"});
  // tx.wait(1);

}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
