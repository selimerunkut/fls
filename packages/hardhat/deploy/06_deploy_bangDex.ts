import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getNetworkConfig } from "../utils/networkConfig";
import { ethers } from "hardhat";

const deployBangDEX: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const config = getNetworkConfig(hre);

  if (!config.isDex) {
    return;
  }

  const bridge = await ethers.getContract("HLCCIPBridge");
  const pythOracle = await ethers.getContract("PythPriceOracle");

  const deployment = await deploy("BangDEX", {
    from: deployer,
    args: [
      config.hub.id,
      config.hub.address,
      bridge.target,
      config.payToken,
      pythOracle.target,
      60 * 60 * 24,
      deployer,
    ],
    log: true,
    autoMine: true,
  });

};

export default deployBangDEX;

// Tags are useful to selectively deploy contracts
deployBangDEX.tags = ["BangDEX"];
