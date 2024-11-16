import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {getNetworkConfig} from "../utils/networkConfig";
import {PythPriceOracle} from "../typechain-types";

const deployOmniChainBridge: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const config = getNetworkConfig(hre);

  const deployment = await deploy("OmniChainBridge", {
    from: deployer,
    args: [config.omni.endpoint, deployer],
    log: true,
    autoMine: true,
  });

  console.log("OmniChain Bridge deployed to:", deployment.address);
};

export default deployOmniChainBridge;

// Tags are useful to selectively deploy contracts
deployOmniChainBridge.tags = ["OmniChain Bridge"];
