import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getNetworkConfig } from "../utils/networkConfig";

const deployPythPriceOracle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const config = getNetworkConfig(hre);

  if (!config.isDex) {
    return;
  }

  

  const deployment = await deploy("PythPriceOracle", {
    from: deployer,
    args: [deployer, config.pyth.address],
    log: true,
    autoMine: true,
  });

};

export default deployPythPriceOracle;

// Tags are useful to selectively deploy contracts
deployPythPriceOracle.tags = ["PythPriceOracle"];
