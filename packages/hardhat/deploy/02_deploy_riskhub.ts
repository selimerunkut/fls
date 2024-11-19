import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { getNetworkConfig } from "../utils/networkConfig";

const deployRiskHub: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const bridge = await ethers.getContract("HLCCIPBridge");

  const config = getNetworkConfig(hre);

  if (!config.isHub) {
    return;
  }

  // Deploy the RiskHub contract
  const deployment = await deploy("RiskHub", {
    from: deployer,
    args: [config.payToken, bridge.target, deployer],
    log: true,
    autoMine: true,
  });

};

export default deployRiskHub;

// Tags are useful for running specific deployments
deployRiskHub.tags = ["RiskHub"];
