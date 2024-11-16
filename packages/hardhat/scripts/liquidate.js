
const hre = require("hardhat");
const { deployments, getNamedAccounts } = hre;
const { ethers_hardhat } = require('hardhat');
import { ethers } from "hardhat";
const timers = require('timers-promises')




async function main() {


  let token_contract;

  const token_Factory = await hre.ethers.getContractFactory("SwapLiquidator");
  console.log("network name", hre.network.name)
  const providerAddress = hre.network.config.url
  const provider = new ethers.JsonRpcProvider(providerAddress);

  if (hre.network.name == 'localhost') {
    // const TOKEN_proxyFactory = await ethers.getContractFactory("NVMToken");
    // token_contract = await upgrades.deployProxy(TOKEN_proxyFactory, ['300000000000000000000000000'], { initializer: "__initializeNVM" });
    token_contract = await ethers.getContract("SwapLiquidator");
    //providerAddress = 'http://localhost:8545'
    console.log("on localhost")
  } else if (hre.network.name == 'testnet') {
    console.log("on testnet")
    token_contract = await token_Factory.attach("")

  } else if (hre.network.name == 'mainnet') {
    console.log("on mainnet")
    token_contract = await token_Factory.attach("")

  }
  console.log("token_contract address: ", token_contract.target)

  const DEX_ADMIN_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"
  // Novem minter address
  const liquidatorWalletAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

  const txResult_minterrole = await token_proxy_contract.grantRole(DEX_ADMIN_ROLE, liquidatorWalletAddress);

  console.log("waiting for transaction to complete", txResult_dexAdminRole)
  await waitUntilTransactionMined(txResult_minterrole.hash, provider)
  await timers.setTimeout(5000);
  console.log("has DEX_ADMIN_ROLE role: ", await token_proxy_contract.hasRole(DEX_ADMIN_ROLE, liquidatorWalletAddress));

    


}



function checkTransactionStatus(transactionHash, provider) {
  return new Promise((resolve, reject) => {
    provider.getTransactionReceipt(transactionHash)
      .then((receipt) => {
        if (receipt && receipt.status === 1) {
          console.log('Transaction completed successfully!');
          console.log('Gas used:', receipt.gasUsed.toString());
          console.log('Transaction hash:', receipt.transactionHash);
          console.log('Block number:', receipt.blockNumber);
          console.log('Block timestamp:', receipt.timestamp);
          // You can access more properties of the receipt, if needed
          resolve(receipt.status); // Resolve the promise with the receipt status
        } else if (receipt && receipt.status === 0) {
          console.log('Transaction failed!');
          resolve(receipt.status); // Resolve the promise with the receipt status
        } else {
          console.log('Transaction is still pending.');
          resolve(null); // Resolve the promise with null for pending status
        }
      })
      .catch((error) => {
        console.error('Error fetching transaction receipt:', error);
        reject(error); // Reject the promise if there's an error
      });
  });
}



async function waitUntilTransactionMined(transactionHash, provider) {
  let transactionStatus = null;
  while (transactionStatus == null) {
    try {
      transactionStatus = await checkTransactionStatus(transactionHash, provider);
      console.log("Transaction status:", transactionStatus);
      await timers.setTimeout(5000);
      console.log("Waited 5 seconds.");
    } catch (error) {
      console.error('Error checking transaction status:', error);
      break; // Exit the loop if there's an error to avoid infinite loop
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
