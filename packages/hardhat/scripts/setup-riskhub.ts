import * as dotenv from "dotenv";
import * as hre from "hardhat";
import { CCIPBridge, PythPriceOracle, RiskHub, SwapLiquidator } from "../typechain-types";
import { getNetworkConfig } from "../utils/networkConfig";
dotenv.config();

const DEXES = [
  {
    chain: 84532,
    destinationChain: "10344971235874465080",
    bangDex: "0x2cb98EEc9848ab082AD7E31B91372Ec88CA3A761",
    slotSize: 60 * 60 * 24,
    amount: "500000",
    receiver: "0x814E735c5DD19240c85E2513DD926Bc3a39f7140",
    gasLimit: "3000000",
  },
];
async function main() {
  const { deployer } = await hre.getNamedAccounts();
  const config = getNetworkConfig(hre);

  const riskHub = (await hre.ethers.getContract("RiskHub")) as RiskHub;
  const ccipBridge = (await hre.ethers.getContract("CCIPBridge")) as CCIPBridge;
  const swapLiquidator = (await hre.ethers.getContract("SwapLiquidator")) as SwapLiquidator;

  let tx;

  // console.log("Adding RiskHub roles to deployer");
  // const roles = await  Promise.all([
  //   riskHub.DEX_ADMIN_ROLE(),
  //   riskHub.DEX_LIQUIDITY_ROLE(),
  //   riskHub.DEX_MESSENGER_ROLE(),
  //   riskHub.WITHDRAW_ROLE(),
  // ])
  // for (const role of roles) {
  //   tx = await riskHub.grantRole(role, deployer);
  //   await tx.wait(1);
  // }
  // console.log("Finish adding RiskHub roles to deployer");
  //
  // console.log("Adding CCIPBridge roles to deployer");
  // tx = await ccipBridge.grantRole(await ccipBridge.CHAIN_ADMIN_ROLE(), deployer);
  // tx.wait(1);
  // console.log("Finish adding CCIPBridge roles to deployer");
  //
  // console.log("Sending link tokens...");
  // const link = await hre.ethers.getContractAt("ERC20", config.ccip.link);
  // tx = await link.transfer(ccipBridge.target, "1000000000000000000");
  // await tx.wait(1);
  //
  // console.log("Sending pay tokens...");
  // const payToken = await hre.ethers.getContractAt("ERC20", config.payToken);
  // tx = await payToken.transfer(riskHub.target, "2000000");
  // await tx.wait(1);

  for (const dex of DEXES) {
    console.log("Setting target chain in CCIP Bridge", dex.chain);
    tx = await ccipBridge.setTargetChain(dex.destinationChain, dex.receiver, dex.gasLimit);
    console.log("Adding dex to RiskHub", dex.chain);
    tx = await riskHub.addDex(dex.destinationChain, dex.bangDex, dex.slotSize);
    await tx.wait(1);
    console.log("Depositing in dex from RiskHub", dex.chain);
    tx = await riskHub.sendToDex(dex.destinationChain, dex.amount, { gasLimit: 3000000 });
    await tx.wait(1);
  }

  // TODO: Is this okey?
  // tx = swapLiquidator.grantRole(await swapLiquidator.CHAIN_ADMIN_ROLE(), config.omni.endpoint);
  // await tx.wait(1);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
