import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {getNetworkConfig} from "../utils/networkConfig";
import {CCIPBridge, PythPriceOracle} from "../typechain-types";
import {ethers} from "hardhat";

const deployOmniCrossChainLiquidator: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const config = getNetworkConfig(hre);

  if(!config.isDex) {
    return;
  }

  const bridge = (await ethers.getContract("OmniChainBridge"));
  const deployment = await deploy("CrossChainLiquidator", {
    from: deployer,
    args: [
      bridge.target,
      config.hub.address,
      config.hub.id,
      deployer
    ],
    log: true,
    autoMine: true,
  });

  console.log("CrossChain Liquidator deployed to:", deployment.address);
};

export default deployOmniCrossChainLiquidator;

// Tags are useful to selectively deploy contracts
deployOmniCrossChainLiquidator.tags = ["Bridge Liquidator"];
