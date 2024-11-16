import * as dotenv from "dotenv";
import * as hre from "hardhat";
import {
  BangDEX,
  CCIPBridge,
  CrossChainLiquidator,
  OmniChainBridge,
  PythPriceOracle,
  RiskHub,
  SwapLiquidator,
} from "../typechain-types";
import { getNetworkConfig } from "../utils/networkConfig";
dotenv.config();

async function main() {
  const { deployer } = await hre.getNamedAccounts();
  const config = getNetworkConfig(hre);

  const bangDex = (await hre.ethers.getContract("BangDex")) as BangDEX;
  const crossChainLiquidator = (await hre.ethers.getContract("CrossChainLiquidator")) as CrossChainLiquidator;

  let tx;

  console.log("Adding BangDex roles to deployer");
  const roles = await Promise.all([
    bangDex.RISK_HUB_ROLE(),
    bangDex.ORACLE_ADMIN_ROLE(),
    bangDex.SET_SLOT_SIZE_ROLE(),
    bangDex.LIQUIDATOR_ADMIN_ROLE(),
    bangDex.MARKET_ADMIN_ROLE(),
  ]);
  for (const role of roles) {
    tx = await bangDex.grantRole(role, deployer);
    await tx.wait(1);
  }
  console.log("Finish adding BangDex roles to deployer");

  console.log("Adding CrossChainLiquidator roles to deployer");
  tx = await crossChainLiquidator.grantRole(await crossChainLiquidator.LIQUIDATOR_ADMIN_ROLE(), deployer);
  tx.wait(1);
  console.log("Finish adding CrossChainLiquidator roles to deployer");

  console.log("Sending pay tokens...");
  const payToken = await hre.ethers.getContractAt("ERC20", config.payToken);
  tx = await payToken.transfer(riskHub.target, "2000000");
  await tx.wait(1);

  for (const dex of DEXES) {
    console.log("Setting target chain in CCIP Bridge", dex.chain);
    tx = await ccipBridge.setTargetChain(dex.destinationChain, dex.receiver, dex.gasLimit);
    console.log("Adding dex to RiskHub", dex.chain);
    tx = await riskHub.addDex(dex.destinationChain, dex.bangDex, dex.slotSize);
    await tx.wait(1);
    console.log("Depositing in dex from RiskHub", dex.chain);
    tx = await riskHub.sendToDex(dex.destinationChain, dex.amount, { gasLimit: 3000000 });
    await tx.wait(1);
  }

  // TODO: Is this okey?
  // tx = swapLiquidator.grantRole(await swapLiquidator.CHAIN_ADMIN_ROLE(), config.omni.endpoint);
  // await tx.wait(1);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
