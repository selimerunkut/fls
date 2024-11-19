import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getNetworkConfig } from "../utils/networkConfig";

const deployOmniChainBridge: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const config = getNetworkConfig(hre);

  console.log("Deploying OmniChain Bridge...", config.omni.endpoint);

  const deployment = await deploy("OmniChainBridge", {
    from: deployer,
    args: [config.omni.endpoint, deployer],
    log: true,
    autoMine: true,
  });

};

export default deployOmniChainBridge;

// Tags are useful to selectively deploy contracts
deployOmniChainBridge.tags = ["OmniChain Bridge"];
