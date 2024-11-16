import * as dotenv from "dotenv";
import { ethers } from "hardhat";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {CCIPBridge, PythPriceOracle, RiskHub} from "../typechain-types";
import {getNetworkConfig} from "../utils/networkConfig";
import {HermesClient} from "@pythnetwork/hermes-client";
dotenv.config();


async function main(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const config = getNetworkConfig(hre);

  const connection = new HermesClient("https://hermes.pyth.network", {});
  const pythPriceOracle = (await ethers.getContract("PythPriceOracle")) as PythPriceOracle;

  let tx;
  for (const feed of config.pyth.feeds) {
    tx = pythPriceOracle.addFeed({id: feed.id, age: feed.age}, feed.token, config.payToken);
    await tx.wait(1);
    // TODO: Optimize and call everyone at once
    const priceUpdates = await connection.getLatestPriceUpdates([feed.id]);
    tx = pythPriceOracle.updatePrice(
      priceUpdates[0].binary.data,
      feed.token,
      config.payToken,
    );
    tx.wait(1);
  }

}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
