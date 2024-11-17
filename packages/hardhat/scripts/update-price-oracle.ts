import * as dotenv from "dotenv";
import * as hre from "hardhat";
import {HLCCIPBridge, MyOFT, PythPriceOracle, RiskHub, SwapLiquidator} from "../typechain-types";
import { getNetworkConfig } from "../utils/networkConfig";
import {ethers} from "hardhat";
import {HermesClient} from "@pythnetwork/hermes-client";
dotenv.config();

const DEXES = [
  {
    chain: 84532,
    chainSelector: "10344971235874465080",
    bangDex: "0x1E2C9a561F217a5f2AF9735711aaF18B710F6881",
    slotSize: 60 * 60 * 24,
    amount: "500000",
    receiver: "0x814E735c5DD19240c85E2513DD926Bc3a39f7140",
    gasLimit: "3000000",
  },
];
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
