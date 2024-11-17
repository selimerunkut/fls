# FLS

Cross-chain atomic swaps for a fragmented liquidity environment. Buy tokens in atomic swaps and resell them asynchronously, using bridges and intents.

![FLS](https://github.com/user-attachments/assets/b7fa631b-f483-4c85-8fa3-c0930a4195a8)


## Description

Traditional atomic DEXes operate isolated, without any information but the on-chain liquidity of tokens traded. This is particularly bad in a multi-chain context with fragmented liquidity.

Intents and cross-chain intents are great solutions for this problem. Still, the asynchronicity doesn't fit well for many use cases: liquidations, vaults, interoperability, fee collection, or just hurried-up users.

In Bang, we tackle this problem by providing atomic one-side swaps based on Oracle prices for listed tokens. 

The protocol efficiently manages shared cross-chain liquidity in USDC to acquire these tokens in low liquidity chains (secondary chains). Then the tokens are sold asynchronously using bridges, cross-chain intents, or different strategies. 

This effectively connects the demand for atomic swaps with asynchronous and cross-chain solutions, efficiently managing liquidity and risk.

On the other hand, the acquired tokens should be sold at a better price than the acquisition cost. There's a risk in the operation, so we apply discounts to the oracle price and swap capacity limits, and the discounts increase with the utilization of the capacity.

Two key aspects drive the design of the solution:

### 1. Liquidity efficiency

Since our intention is to develop a multi-chain protocol that exists in many small chains, then it's critical to efficiently allocate the available USDC liquidity across them. 

The design of the protocol is such that the secondary chains communicate the trades to the main chain, as fast as possible (using a fast bridge) and the main chain refills their USDC capacity also as fast as possible, without waiting for the liquidation of the acquired tokens.

This way we don't need to allocate big amounts of idle liquidity on each small chain. 

### 2. Risk Management

Buying tokens based on oracle prices, that will be sold minutes after transferring them to a chain with more liquidity, is a risky business. 

The protocol was designed to allow a granular parametrization of the markets, defining capacity per market and token, discount ranges, and fixed costs per trade.

These parameters operate on time-windows, with explicit renewals for each period.

The different liquidation strategies operate in a trade-off between finding the best price and selling as soon as possible. 

In the future, we might off-load the risk, by transferring it to an insurance protocol like NexusMutual or Ensuro.

## Architecture

![image](https://github.com/user-attachments/assets/ba0ac637-8876-4358-9da5-c63beb8d37cd)

The architecture of the solution is the following:

### DEX contract

It's a contract that will be deployed on each chain where we accept trades (price-follower chains).

This contract implements a price curve that's based on the oracle price, applying a discount that increases as more capacity for a given token has been used, in a given timeslot.

Supporting this contract, we have two contracts:
- IBridge: this contract transfers USDC to the main chain and sends messages to it. It was implemented using Hyperlane for remote calls and CCIP (with underlying CCTP) for transfer of USDC.
- IPriceOracle: this contract provides the prices of the listed tokens. It was implemented using Pyth Oracle, a solution that gives us flexibility to on-board a great variety of tokens.


### Liquidators

These contracts are the ones responsible for receiving the acquired tokens, selling them, and sending the resulting USDC to the main chain.

The protocol supports different liquidators for each token on each chain. This gives us the flexibility to implement the most suitable strategy for each particular case.

Some of the liquidators implement the bridge-and-swap strategy. This means they transfer the tokens to the main chain, which generally has a lot of liquidity and competitive swap markets. Once the tokens arrive, they are sold and the result is transferred to the Risk Hub (see below).

For bridging the tokens, we implemented CCIP, Hyperlane, and LayerZero (OFTs). The idea is to use the canonical bridge, when available.

Another strategy is selling the tokens using intents, either on the same chain (using Cow Protocol and then bridging the USDC to the main chain) or with cross-chain protocols like 1inch Fusion+. We couldn't yet implement either 1inch or Cow Protocol, using intents signed by smart contracts, but is part of our plans.

Other strategies can be implemented in the future, like selling the tokens in several small trades, to avoid slippage.

### Risk Hub

This contract is deployed once, in the "main chain". This chain should have a lot of liquidity in most of the tokens, it could be Arbitrum or Base.

The responsibility of this contract is to refund the DEXes for the trades made. This contract also receives the results of the liquidations. 

This way, this contract is the one that effectively faces the risk and the profits. If on average the acquired tokens are sold and a higher price than the acquisition cost, it will have profits. Otherwise, it will have losses. 

To stabilize the returns of the protocol, in future versions, we might off-load the risk to an on-chain insurance protocol, like Ensuro or NexusMutual.

This contract also uses a CCIP Bridge and Hyperlane for the transfer of USDC and communication with the DEXes.


## Developer instructions

### install
1. install
`nvm use v22`

`yarn`


2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/hardhat/hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

### Hyperlane warpbridging token

#### make config
`hyperlane warp init`

#### deploy smart contracts
`hyperlane warp deploy`

#### test
`hyperlane warp send --verbosity debug --relay --symbol ETH --destination sepolia`


### multi chain address reference notes

addresses can be added to `packages/hardhat/deploy/utils/addresses_list.json`

network name should match the `packages/hardhat/hardhat.config.ts` names, example: `arbitrumSepolia`

#### usdc
https://circle.com/multi-chain-usdc

#### pyth oracle
https://docs.pyth.network/price-feeds/contract-addresses/evm

#### uniswap router
mainnet : `0xE592427A0AEce92De3Edee1F18E0157C05861564`

sepolia arbitrum: `0xf0b8f48380ccd8bcdd4c953479ad0164f926ce7e`
https://sepolia.arbiscan.io/address/0xf0b8f48380ccd8bcdd4c953479ad0164f926ce7e

### used boilerplate

#### 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>
