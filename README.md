# bang
## ¡BANG! ¡BANG!… Estás liquidado.

## install
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

## multi chain address reference notes

addresses can be added to `packages/hardhat/deploy/utils/addresses_list.json`

network name should match the `packages/hardhat/hardhat.config.ts` names, example: `arbitrumSepolia`

### usdc
https://circle.com/multi-chain-usdc

### pythe oracle
https://docs.pyth.network/price-feeds/contract-addresses/evm

### uniswap router
mainnet & testnet: `0xE592427A0AEce92De3Edee1F18E0157C05861564`

## used boilerplate

#### 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>


