import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployPythPriceOracle: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Replace these with the appropriate addresses
  const ownerAddress = deployer; // Replace with the desired owner address
  //https://docs.pyth.network/price-feeds/contract-addresses/evm
  const pythContractAddress = "0xff1a0f4744e8582DF1aE09D5611b887B6a12925C"; // Replace with the deployed Pyth contract address

  if (!pythContractAddress) {
    throw new Error("Please provide a valid Pyth contract address for deployment.");
  }

  const deployment = await deploy("PythPriceOracle", {
    from: deployer,
    args: [ownerAddress, pythContractAddress], // Constructor arguments
    log: true,
    autoMine: true, // Automatically mine the deployment transaction
  });

  console.log("PythPriceOracle deployed to:", deployment.address);
};

export default deployPythPriceOracle;

// Tags are useful to selectively deploy contracts
deployPythPriceOracle.tags = ["PythPriceOracle"];
