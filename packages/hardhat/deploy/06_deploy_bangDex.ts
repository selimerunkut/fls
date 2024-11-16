import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getNetworkConfig } from "../utils/networkConfig";
import { CCIPBridge, PythPriceOracle } from "../typechain-types";
import { ethers } from "hardhat";

const deployOmniChainBridge: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const config = getNetworkConfig(hre);

  if (!config.isDex) {
    return;
  }

  const bridge = await ethers.getContract("CCIPBridge");
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

  console.log("OmniChain Bridge deployed to:", deployment.address);
};

export default deployOmniChainBridge;

// Tags are useful to selectively deploy contracts
deployOmniChainBridge.tags = ["OmniChain Bridge"];
