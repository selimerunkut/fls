import { expect } from "chai";
import { ethers } from "hardhat";
import {MockPyth, PythPriceOracle} from "../typechain-types";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";
import {beforeEach} from "mocha";

const ETH_PRICE_FEED_ID = ethers.encodeBytes32String('ETH_PRICE_FEED_ID');
const TOKEN_PRICE = 10000000;

describe("PythPriceOracle", function () {
  let pyth: MockPyth;
  let pythPriceOracle: PythPriceOracle;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let token1: HardhatEthersSigner;
  let usdToken: HardhatEthersSigner;

  before(async () => {
    [owner, user, token1, usdToken] = await ethers.getSigners();


    // Deploy mock Pyth
    const PythMockFactory = await ethers.getContractFactory("MockPyth");
    pyth = (await PythMockFactory.deploy(60, 1)) as MockPyth;
    await pyth.waitForDeployment();

    // Deploy Price Oracle
    const PythPriceOracleFactory = await ethers.getContractFactory("PythPriceOracle");
    pythPriceOracle = (await PythPriceOracleFactory.deploy(
      owner.address,
      pyth.target,
    )) as PythPriceOracle;
    await pythPriceOracle.waitForDeployment()
  });

  describe("Get Price", function () {
    beforeEach(async() => {
      const block = (await ethers.provider.getBlock('latest'))!;
      await pythPriceOracle.addFeed({id: ETH_PRICE_FEED_ID, age: 5}, token1.address, usdToken.address);

      const updateData = [await pyth.createPriceFeedUpdateData(
        ETH_PRICE_FEED_ID,
        TOKEN_PRICE,
        10 * 100000,
        -5,
        TOKEN_PRICE,
        10 * 100000,
        block.timestamp,
        block.timestamp
      )];
      await pythPriceOracle.updatePrice(
        updateData,
        token1.address,
        usdToken.address,
        {value: ethers.parseEther("0.1")}
      );
    })

    it("Should successfully liquidate asset tokens for USDC", async function () {
      console.log(await pythPriceOracle.getCurrentPrice(token1.address, usdToken.address));
    });
  });
});
