import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployRiskHub: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Replace with the actual USDC token address and admin address for your network
  // Address of the USDC token https://docs.arbitrum.io/arbitrum-bridge/usdc-arbitrum-one
  const usdcTokenAddress = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"; 
  const adminAddress = deployer; // Set deployer as admin, or replace with a specific admin address

  if (!usdcTokenAddress) {
    throw new Error("Please provide a valid USDC token address for deployment.");
  }

  const deployment = await deploy("RiskHub", {
    from: deployer,
    args: [usdcTokenAddress, adminAddress], // Constructor arguments
    log: true,
    autoMine: true, // Automatically mine the deployment transaction
  });

  console.log("RiskHub deployed to:", deployment.address);

  //const riskHub = await hre.ethers.getContract("RiskHub", deployer);
  //await riskHub.grantRole(await riskHub.DEX_ADMIN_ROLE(), someDexAdminAddress);
};

export default deployRiskHub;

deployRiskHub.tags = ["RiskHub"];
