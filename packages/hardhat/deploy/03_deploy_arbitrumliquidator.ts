// Filename: deploy/00_deploy_ArbitrumLiquidator.ts

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { RiskHub } from "../typechain-types";
import { ethers } from "hardhat";

const deployArbitrumLiquidator: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const riskHubContract = (await ethers.getContract("RiskHub")) as RiskHub;

  // Define the constructor arguments for the ArbitrumLiquidator
  //https://docs.uniswap.org/contracts/v3/reference/deployments/arbitrum-deployments
  const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  // Address of the USDC token https://docs.arbitrum.io/arbitrum-bridge/usdc-arbitrum-one
  const usdcTokenAddress = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
  const riskHub = riskHubContract.target;
  console.log("riskHub contract address: ", riskHub);

  await deploy("ArbitrumLiquidator", {
    from: deployer,
    args: [swapRouter, usdcTokenAddress, riskHub],
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
