import * as dotenv from "dotenv";
import * as hre from "hardhat";
import {
  BangDEX,
  CrossChainLiquidator, EOALiquidator, HLCCIPBridge, MyOFT,
  PythPriceOracle,
} from "../typechain-types";
import { getNetworkConfig } from "../utils/networkConfig";
import {HermesClient} from "@pythnetwork/hermes-client";
import {ethers} from "hardhat";
dotenv.config();

async function main() {
  const { deployer } = await hre.getNamedAccounts();

  const config = getNetworkConfig(hre);

  const connection = new HermesClient("https://hermes.pyth.network", {});

  const bangDex = (await hre.ethers.getContract("BangDEX")) as BangDEX;
  const crossChainLiquidator = (await hre.ethers.getContract("CrossChainLiquidator")) as CrossChainLiquidator;
  const hlCcipBridge = (await hre.ethers.getContract("HLCCIPBridge")) as HLCCIPBridge;
  const eoaLiquidator = (await hre.ethers.getContract("EOALiquidator")) as EOALiquidator;
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

  // console.log("Adding BangDex roles to deployer");
  // const roles = await Promise.all([
  //   bangDex.RISK_HUB_ROLE(),
  //   bangDex.ORACLE_ADMIN_ROLE(),
  //   bangDex.SET_SLOT_SIZE_ROLE(),
  //   bangDex.LIQUIDATOR_ADMIN_ROLE(),
  //   bangDex.MARKET_ADMIN_ROLE(),
  // ]);
  // for (const role of roles) {
  //   tx = await bangDex.grantRole(role, deployer);
  //   await tx.wait(1);
  // }
  // console.log("Finish adding BangDex roles to deployer");
  //
  // console.log("Adding CrossChainLiquidator roles to the dex");
  // tx = await crossChainLiquidator.grantRole(
  //   await crossChainLiquidator.LIQUIDATOR_ADMIN_ROLE(),
  //   bangDex.target
  // );
  // tx.wait(1);
  // console.log("Finish adding CrossChainLiquidator roles to dex");
  //
  // console.log("Adding Liquidator");
  // tx = await bangDex.setLiquidator(token.target, eoaLiquidator.target);
  // await tx.wait(1);
  //
  // console.log("Sending pay tokens...");
  // const payToken = await hre.ethers.getContractAt("ERC20", config.payToken);
  // tx = await payToken.transfer(bangDex.target, "1000000");
  // await tx.wait(1);
  //
  // console.log("Adding Market");
  // tx = await bangDex.setMarketParameters(
  //   token.target,
  //   await bangDex.slotSize(),
  //   "20043", // TODAY
  //   "980000000000000000", // 0.98
  //   "900000000000000000", // 0.9
  //   "100000000000000000000", // 100
  //   "10", // 10 cents
  // )
  // await tx.wait(1);
  //
  // console.log("Adding Market");
  // tx = await bangDex.setMarketParameters(
  //   token.target,
  //   await bangDex.slotSize(),
  //   "20044", // TOMORROW
  //   "980000000000000000", // 0.98
  //   "900000000000000000", // 0.9
  //   "100000000000000000000", // 100
  //   "10", // 10 cents
  // )
  // await tx.wait(1);

  const [sender] = await ethers.getSigners(); // Get the first signer from the Hardhat accounts
  tx = await sender.sendTransaction({to: hlCcipBridge.target, value: "30000000000000000"});
  tx.wait(1);

}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
