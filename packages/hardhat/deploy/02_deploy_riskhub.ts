import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {CCIPBridge, MockBridge} from "../typechain-types";
import { ethers } from "hardhat";
import { getNetworkConfig } from "../utils/networkConfig";

const deployRiskHub: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const bridgeContract = (await ethers.getContract("CCIPBridge")) as CCIPBridge;

  const config = getNetworkConfig(hre);

  // Don't deploy if it's not a hub chain
  if(!config.isHub) {
    return;
  }

  // Deploy the RiskHub contract
  const deployment = await deploy("RiskHub", {
    from: deployer,
    args: [config.payToken, bridgeContract.target, deployer],
    log: true,
    autoMine: true,
  });

  console.log("RiskHub deployed to:", deployment.address);
};

export default deployRiskHub;

// Tags are useful for running specific deployments
deployRiskHub.tags = ["RiskHub"];
