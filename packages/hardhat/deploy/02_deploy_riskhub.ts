import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployRiskHub: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Replace with the USDC token address for your network
  const usdcToken = "0x..."; // Address of the USDC token

  if (!usdcToken || usdcToken === "0x...") {
    throw new Error("Please provide a valid USDC token address for deployment.");
  }

  await deploy("RiskHub", {
    from: deployer,
    args: [usdcToken, deployer], // Pass deployer as owner
    log: true,
    autoMine: true, // Automatically mine the deployment transaction
  });

  const riskHub = await hre.ethers.getContract("RiskHub", deployer);
  console.log("RiskHub deployed to:", riskHub.address);
};

export default deployRiskHub;

deployRiskHub.tags = ["RiskHub"];
