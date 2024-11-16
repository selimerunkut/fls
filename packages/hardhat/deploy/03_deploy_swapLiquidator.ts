// Filename: deploy/00_deploy_ArbitrumLiquidator.ts

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {RiskHub, SwapLiquidator} from "../typechain-types";
import { ethers } from "hardhat";
import {getNetworkConfig} from "../utils/networkConfig";

const deploySwapLiquidator: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const config = getNetworkConfig(hre);

  // Don't deploy if it's not a hub chain
  if(!config.isHub) {
    return;
  }

  if(!config.swapLiquidatorRouter) {
    throw Error("Can't deploy SwapLiquidator without a router address");
  }

  const riskHubContract = (await ethers.getContract("RiskHub")) as RiskHub;

  await deploy("SwapLiquidator", {
    from: deployer,
    args: [config.swapLiquidatorRouter, config.payToken, riskHubContract.target, deployer],
    log: true,
    autoMine: true,
  });

  // Fetch the deployed contract
  const swapLiquidator = await hre.ethers.getContract<SwapLiquidator>("SwapLiquidator", deployer);

  console.log("Swap Liquidator deployed to:", swapLiquidator.target);
};

export default deploySwapLiquidator;

// Tags are useful for running specific deployments
deploySwapLiquidator.tags = ["SwapLiquidator"];
