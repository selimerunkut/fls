import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { RiskHub } from "../typechain-types";
import { ethers } from "hardhat";

const deployRiskHub: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const bridgeContract = (await ethers.getContract("MockBridge")) as MockBridge;


  // Replace with the actual addresses for your network
  const payTokenAddress = "0x000000000000000000000000000000000000"; // USDC token address (IERC20Metadata)
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

  // Optionally, verify deployment by connecting to the contract
  const riskHub = await ethers.getContractAt("RiskHub", deployment.address);
  console.log("RiskHub verified at:", riskHub.address);
};

export default deployRiskHub;

// Tags are useful for running specific deployments
deployRiskHub.tags = ["RiskHub"];