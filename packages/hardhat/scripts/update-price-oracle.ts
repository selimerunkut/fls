import * as dotenv from "dotenv";
import * as hre from "hardhat";
import {HLCCIPBridge, MyOFT, PythPriceOracle, RiskHub, SwapLiquidator} from "../typechain-types";
import { getNetworkConfig } from "../utils/networkConfig";
import {ethers} from "hardhat";
import {HermesClient} from "@pythnetwork/hermes-client";
dotenv.config();

async function main() {
  const { deployer } = await hre.getNamedAccounts();
  const config = getNetworkConfig(hre);

  const connection = new HermesClient("https://hermes.pyth.network", {});
  const pythPriceOracle = (await ethers.getContract("PythPriceOracle")) as PythPriceOracle;
  const token = (await hre.ethers.getContract("MyOFT")) as MyOFT;

  let tx;

  console.log("Updating Pyth Price...");
  for (const feed of config.pyth.feeds) {
    feed.token = token.target.toString();

    tx = await pythPriceOracle.addFeed({ id: feed.id, age: feed.age }, feed.token, config.payToken);
    await tx.wait(1);
    // TODO: Optimize and call everyone at once
    const priceUpdates = await connection.getLatestPriceUpdates([feed.id]);
    tx = await pythPriceOracle.updatePrice(
      priceUpdates.binary.data.map((x: string) => `0x${x}`),
      feed.token,
      config.payToken,
      {value: '1000000000000000'}
    );
    await tx.wait(1);

    tx = await pythPriceOracle.withdraw();
    await tx.wait(1);
    console.log("Price Updated", await pythPriceOracle.getCurrentPrice(feed.token, config.payToken));
  }
  console.log("Finish updating Pyth Price");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
