import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {getNetworkConfig} from "../utils/networkConfig";
import {PythPriceOracle} from "../typechain-types";

const deployPythPriceOracle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const config = getNetworkConfig(hre);

  const deployment = await deploy("PythPriceOracle", {
    from: deployer,
    args: [deployer, config.pyth.address],
    log: true,
    autoMine: true,
  });

  // const pythPriceOracle = await hre.ethers.getContract<PythPriceOracle>("PythPriceOracle", deployer);

  // for (const feed of config.pyth.feeds) {
  //   await pythPriceOracle.addFeed(
  //     { id: feed.id, age: feed.age },
  //     feed.token,
  //     config.payToken
  //   );
  // }


  console.log("PythPriceOracle deployed to:", deployment.address);
};

export default deployPythPriceOracle;

// Tags are useful to selectively deploy contracts
deployPythPriceOracle.tags = ["PythPriceOracle"];
