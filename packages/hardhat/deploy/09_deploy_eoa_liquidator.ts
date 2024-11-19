import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getNetworkConfig } from "../utils/networkConfig";

const deployEOALiquidator: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const config = getNetworkConfig(hre);

  if(!config.isDex) {
    return;
  }

  const deployment = await deploy("EOALiquidator", {
    from: deployer,
    args: [deployer, deployer],
    log: true,
    autoMine: true,
  });

};

export default deployEOALiquidator;

// Tags are useful to selectively deploy contracts
deployEOALiquidator.tags = ["EOA Liquidator"];
