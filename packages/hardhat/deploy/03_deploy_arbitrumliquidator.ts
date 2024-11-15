// Filename: deploy/00_deploy_ArbitrumLiquidator.ts

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployArbitrumLiquidator: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Define the constructor arguments for the ArbitrumLiquidator
  const swapRouter = "0x..."; // Replace with the Uniswap V3 Router address on Arbitrum
  const usdcToken = "0x..."; // Replace with the USDC token address on Arbitrum
  const riskHub = "0x..."; // Replace with the RiskHub contract address

  await deploy("ArbitrumLiquidator", {
    from: deployer,
    args: [swapRouter, usdcToken, riskHub],
    log: true,
    autoMine: true,
  });

  // Fetch the deployed contract
  const arbitrumLiquidator = await hre.ethers.getContract("ArbitrumLiquidator", deployer);

  console.log("ArbitrumLiquidator deployed to:", arbitrumLiquidator.address);
};

export default deployArbitrumLiquidator;

// Tags are useful for running specific deployments
deployArbitrumLiquidator.tags = ["ArbitrumLiquidator"];
