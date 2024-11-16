import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getNetworkConfig } from "../utils/networkConfig";

const deployOmfTestTokens: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const config = getNetworkConfig(hre);

  if (!config.isDex) {
    return;
  }

  const deployment = await deploy("MyOFT", {
    from: deployer,
    args: ["Pepo Token", "PEPO", config.omni.endpoint, deployer],
    log: true,
    autoMine: true,
  });

  console.log("PEPO token deployed to:", deployment.address);
};

export default deployOmfTestTokens;

// Tags are useful to selectively deploy contracts
deployOmfTestTokens.tags = ["OMF Test Tokens"];
