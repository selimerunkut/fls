import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MockBridge } from "../typechain-types";
import { ethers } from "hardhat";
import { getNetworkConfig } from "../utils/networkConfig";

const deployRiskHub: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const bridgeContract = (await ethers.getContract("MockBridge")) as MockBridge;

  const config = getNetworkConfig(hre);

  const payTokenAddress = config.payToken;; // USDC token address (IERC20Metadata)
  console.log("USDC address:", payTokenAddress);
  const adminAddress = deployer; // Admin address, defaulting to deployer

  if (!payTokenAddress || !bridgeContract.target) {
    throw new Error("Please provide valid addresses for payToken and bridge.");
  }

  // Deploy the RiskHub contract
  const deployment = await deploy("RiskHub", {
    from: deployer,
    args: [payTokenAddress, bridgeContract.target, adminAddress], // Constructor arguments
    log: true,
    autoMine: true, // Automatically mine the deployment transaction
  });

  console.log("RiskHub deployed to:", deployment.address);
};

export default deployRiskHub;

// Tags are useful for running specific deployments
deployRiskHub.tags = ["RiskHub"];