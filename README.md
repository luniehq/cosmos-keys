# Cosmos Keys

Cosmos Keys is a library for creating keys and signing messages on Cosmos. You can use it to generate keypairs and addresses and to sign messages for the Cosmos Network. 

This library deals with tasks that are considered *security-critical* and should be used very carefully.

## Install

```bash
yarn add @lunie/cosmos-keys
```

## Usage

### Create a wallet

```js
import { getNewWallet } from "@lunie/cosmos-keys"

const { cosmosAddress, privateKey, publicKey } = getNewWallet()
// Attention: protect the `privateKey` at all cost and never display it anywhere!!
```

### Import a seed

```js
import { generateWalletFromSeed } from "@lunie/cosmos-keys"

const seed = ...24 seed words here

const { cosmosAddress, privateKey, publicKey } = generateWalletFromSeed(seed)
// Attention: protect the `privateKey` at all cost and never display it anywhere!!
```

### Sign a message

```js
import { signWithPrivateKey } from "@lunie/cosmos-keys"

const privateKey = Buffer.from(...)
const signMessage = ... message to sign, generate messages with "@lunie/cosmos-js"
const signature = signWithPrivateKey(signMessage, privateKey)

```

### Using with cosmos-js

```js
import { signWithPrivateKey } from "@lunie/cosmos-keys"
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
