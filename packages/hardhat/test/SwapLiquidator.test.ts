import { expect } from "chai";
import { ethers } from "hardhat";
import { ArbitrumLiquidator, MockERC20, ISwapRouter } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// Sample test cases for SwapLiquidator.sol.sol

describe("ArbitrumLiquidator", function () {
  let liquidator: ArbitrumLiquidator;
  let usdcToken: MockERC20;
  let assetToken: MockERC20;
  let swapRouter: ISwapRouter;
  let riskHub: SignerWithAddress;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  before(async () => {
    [owner, user, riskHub] = await ethers.getSigners();

    // Deploy mock ERC20 tokens for USDC and the asset
    const ERC20Factory = await ethers.getContractFactory("MockERC20");
    usdcToken = (await ERC20Factory.deploy("USDC", "USDC", 18)) as MockERC20;
    assetToken = (await ERC20Factory.deploy("AssetToken", "AST", 18)) as MockERC20;
    await usdcToken.deployed();
    await assetToken.deployed();

    // Deploy mock Uniswap SwapRouter
    const SwapRouterFactory = await ethers.getContractFactory("MockSwapRouter");
    swapRouter = (await SwapRouterFactory.deploy()) as ISwapRouter;
    await swapRouter.deployed();

    // Deploy SwapLiquidator.sol contract
    const LiquidatorFactory = await ethers.getContractFactory("ArbitrumLiquidator");
    liquidator = (await LiquidatorFactory.deploy(
      swapRouter.address,
      usdcToken.address,
      riskHub.address,
    )) as ArbitrumLiquidator;
    await liquidator.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct swapRouter, usdcToken, and riskHub", async function () {
      expect(await liquidator.swapRouter()).to.equal(swapRouter.address);
      expect(await liquidator.usdcToken()).to.equal(usdcToken.address);
      expect(await liquidator.riskHub()).to.equal(riskHub.address);
    });
  });

  describe("Liquidate", function () {
    beforeEach(async () => {
      // Mint asset tokens to the user for testing liquidation
      await assetToken.mint(user.address, ethers.utils.parseEther("1000"));
    });

    it("Should successfully liquidate asset tokens for USDC", async function () {
      const assetAmount = ethers.utils.parseEther("100");
      const usdcAmount = ethers.utils.parseEther("90"); // Expected USDC amount

      // Set up mock swap response in SwapRouter
      await swapRouter.setSwapResult(usdcAmount);

      // Approve the liquidator to spend user's asset tokens
      await assetToken.connect(user).approve(liquidator.address, assetAmount);

      // Call liquidate function
      await expect(liquidator.connect(user).liquidate(assetToken.address, assetAmount, usdcAmount))
        .to.emit(liquidator, "USDCTransferred")
        .withArgs(riskHub.address, usdcAmount);

      // Check USDC balance of riskHub
      expect(await usdcToken.balanceOf(riskHub.address)).to.equal(usdcAmount);

      // Verify the remaining balance of the user's asset token is correct
      expect(await assetToken.balanceOf(user.address)).to.equal(ethers.utils.parseEther("900"));
    });

    it("Should revert if the received USDC is less than the debtAmount", async function () {
      const assetAmount = ethers.utils.parseEther("100");
      const usdcAmount = ethers.utils.parseEther("80"); // Set lower USDC amount than required debtAmount
      const requiredDebtAmount = ethers.utils.parseEther("90");

      // Set up mock swap response in SwapRouter
      await swapRouter.setSwapResult(usdcAmount);

      // Approve the liquidator to spend user's asset tokens
      await assetToken.connect(user).approve(liquidator.address, assetAmount);

      // Call liquidate function and expect a revert
      await expect(
        liquidator.connect(user).liquidate(assetToken.address, assetAmount, requiredDebtAmount),
      ).to.be.revertedWith("Insufficient USDC received");
    });
  });
});
