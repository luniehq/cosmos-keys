# Cosmos Wallet and Signer

This library helps creating wallets (keypairs and addresses) for Cosmos SDK based blockchains and sign messages for those networks. If you are looking for a library to create messages for those networks, check out https://github.com/luniehq/cosmos-js.

These libraries are split up to split security critical parts like this library from non security critical parts like cosmos-js.

## Install

```bash
yarn add @lunie/js-comos-wallet
```

## Usage

### Create a wallet

```js
import { getWallet } from "@lunie/js-comos-wallet"

const { cosmosAddress, privateKey, publicKey } = getWallet()
// Attention: protect the `privateKey` at all cost and never display it anywhere!!
```

### Import a seed

```js
import { generateWalletFromSeed } from "@lunie/js-comos-wallet"

const seed = ...24 seed words here

const { cosmosAddress, privateKey, publicKey } = generateWalletFromSeed(seed)
// Attention: protect the `privateKey` at all cost and never display it anywhere!!
```

### Sign a message

```js
import { signWithPrivateKey } from "@lunie/js-comos-wallet"

const privateKey = Buffer.from(...)
const signMessage = ... message to sign, generate messages with "@lunie/cosmos-js"
const signature = signWithPrivateKey(signMessage, privateKey)

```

### Using with cosmos-js

```js
import { signWithPrivateKey } from "@lunie/js-comos-wallet"
import Cosmos from "@lunie/cosmos-js"

const privateKey = Buffer.from(...)
const publicKey = Buffer.from(...)

// init cosmos sender
const cosmos = Cosmos(STARGATE_URL, ADDRESS)

// create message
const msg = cosmos
  .MsgSend({toAddress: 'cosmos1abcd09876', amounts: [{ denom: 'stake', amount: 10 }})

// create a signer from this local js signer library
const localSigner = (signMessage) => {
  const signature = signWithPrivateKey(signMessage, privateKey)

  return {
    signature,
    publicKey
  }
}

// send the transaction
const { included }= await msg.send({ gas: 200000 }, localSigner)

// await tx to be included in a block
await included()
```