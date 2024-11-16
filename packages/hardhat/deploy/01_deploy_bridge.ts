import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getNetworkConfig } from "../utils/networkConfig";

const deployMockBridge: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying MockBridge...");

  const deployment = await deploy("MockBridge", {
    from: deployer,
    args: [], // MockBridge does not have constructor arguments
    log: true,
    autoMine: true, // Automatically mine the deployment transaction
  });

  console.log("MockBridge deployed to:", deployment.address);
};

export default deployMockBridge;

deployMockBridge.tags = ["MockBridge"];
