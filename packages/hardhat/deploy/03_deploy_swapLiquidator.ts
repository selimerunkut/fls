// Filename: deploy/00_deploy_ArbitrumLiquidator.ts

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { RiskHub, SwapLiquidator, P2PSwapRouter } from "../typechain-types";
import { ethers } from "hardhat";
import { getNetworkConfig } from "../utils/networkConfig";

const deploySwapLiquidator: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const config = getNetworkConfig(hre);

  if (!config.isHub) {
    return;
  }

  // We dont need `swapLiquidatorRouter` for arbitrumSepolia or even arbitrum while using p2PSwapRouter

  const riskHubContract = (await ethers.getContract("RiskHub")) as RiskHub;
  const p2PSwapRouterContract = (await ethers.getContract("P2PSwapRouter")) as P2PSwapRouter;

  await deploy("SwapLiquidator", {
    from: deployer,
    args: [p2PSwapRouterContract.target, config.payToken, riskHubContract.target, deployer],
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
