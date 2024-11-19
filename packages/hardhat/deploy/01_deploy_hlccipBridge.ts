import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getNetworkConfig } from "../utils/networkConfig";

const deployCCIPBridge: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const config = getNetworkConfig(hre);

  const deployment = await deploy("HLCCIPBridge", {
    from: deployer,
    args: [config.ccip.router, config.ccip.link, deployer, config.interchainAccountRouter],
    log: true,
    autoMine: true,
  });

};

export default deployCCIPBridge;

deployCCIPBridge.tags = ["HLCCIP Bridge"];
