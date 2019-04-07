// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
import bip39 from `bip39`
import bip32 from `bip32`
import bech32 from `bech32`
import secp256k1 from `secp256k1`
import CryptoJS, { SHA256, RIPEMD160 } from 'crypto-js'

const hdPathAtom = `m/44'/118'/0'/0/0` // key controlling ATOM allocation

// The CryptoJS random bytes function should not be used in production, as it is not cryptographically safe
export function randomBytes(size: number): Buffer {
  let hexString = ''
  /* istanbul ignore if: not testable on node */
  if (window.crypto) {
    let keyContainer = new Uint32Array(size / 4)
    keyContainer = window.crypto.getRandomValues(keyContainer)
    for (let keySegment = 0; keySegment < keyContainer.length; keySegment++) {
      hexString += keyContainer[keySegment].toString(16) // Convert int to hex
    }
  } else {
    hexString = CryptoJS.lib.WordArray.random(size).toString()
  }
  return Buffer.from(hexString, 'hex')
}

export function getWalletFromSeed(mnemonic: string): Wallet {
  const masterKey = deriveMasterKey(mnemonic)
  const { privateKey, publicKey } = deriveKeypair(masterKey)
  const cosmosAddress = getCosmosAddress(publicKey.toString('hex'))
  return {
    privateKey,
    publicKey,
    cosmosAddress
  }
}

export function getSeed(randomBytesFunc: (size: number) => Buffer = randomBytes): string {
  const entropy = randomBytesFunc(32)
  if (entropy.length !== 32) throw Error(`Entropy has incorrect length`)
  const mnemonic = bip39.entropyToMnemonic(entropy.toString('hex'))

  return mnemonic
}

export function getWallet(randomBytesFunc: (size: number) => Buffer = randomBytes): Wallet {
  const mnemonic = getSeed(randomBytesFunc)
  return getWalletFromSeed(mnemonic)
}

// NOTE: this only works with a compressed public key (33 bytes)
export function getCosmosAddress(publicKey: string): string {
  const message = CryptoJS.enc.Hex.parse(publicKey)
  const address = RIPEMD160(SHA256(message)).toString()
  const cosmosAddress = bech32ify(address, `cosmos`)

  return cosmosAddress
}

function deriveMasterKey(mnemonic: string): BIP32 {
  // throws if mnemonic is invalid
  bip39.validateMnemonic(mnemonic)

  const seed = bip39.mnemonicToSeed(mnemonic)
  const masterKey = bip32.fromSeed(seed)
  return masterKey
}

function deriveKeypair(masterKey: BIP32): KeyPair {
  const cosmosHD = masterKey.derivePath(hdPathAtom)
  const privateKey = cosmosHD.privateKey
  const publicKey = secp256k1.publicKeyget(privateKey, true)

  return {
    privateKey,
    publicKey
  }
}

// converts a string to a bech32 version of that string which shows a type and has a checksum
function bech32ify(address: string, prefix: string) {
  const words = bech32.toWords(address)
  return bech32.encode(prefix, words)
}

// Signbytes need to be deterministic, therefor we need to sort the properties
// By convention also empty properties get removed
export function prepareSignBytes(json: any): object {
  if (Array.isArray(json)) {
    return json.map(prepareSignBytes)
  }

  // string or number
  if (typeof json !== `object`) {
    return json
  }

  let sorted = {}
  Object.keys(json)
    .sort()
    .forEach(key => {
      if (json[key] === undefined || json[key] === null) return

      ;(sorted as any)[key] = prepareSignBytes(json[key])
    })
  return sorted
}

/*
  The SDK expects the tx to be converted into a certain message (StdSignMsg)
  which then will be serialized and then sign.
  */
export function getSignMessage(
  tx: StandardTx,
  {
    sequence,
    account_number,
    chain_id
  }: { sequence: string; account_number: string; chain_id: string }
): StdSignMsg {
  // sign bytes need amount to be an array
  const fee = {
    amount: tx.fee.amount || [],
    gas: tx.fee.gas
  }

  return <StdSignMsg>prepareSignBytes({
    fee,
    memo: tx.memo,
    msgs: tx.msg, // weird msg vs. msgs
    sequence,
    account_number,
    chain_id
  })
}

// produces the signature for a message (returns Buffer)
export function signWithPrivateKey(signMessage: StdSignMsg, privateKey: Buffer): Buffer {
  const signMessageString = JSON.stringify(signMessage)
  const signHash = Buffer.from(SHA256(signMessageString).toString(), `hex`)
  const { signature } = secp256k1.sign(signHash, privateKey)

  return signature
}

//
export function getSignatureObject(signature: Buffer, publicKey: Buffer) {
  return {
    signature: signature.toString(`base64`),
    pub_key: {
      type: `tendermint/PubKeySecp256k1`, // TODO: allow other keytypes
      value: publicKey.toString(`base64`)
    }
  }
}

// main function to sign a tx using the local keystore wallet
// returns the complete signature object to add to the tx
export function getSignature(
  tx: StandardTx,
  { privateKey, publicKey }: KeyPair,
  requestMetaData: RequestMetaData
): Signature {
  const signMessage = getSignMessage(tx, requestMetaData)
  const signature = signWithPrivateKey(signMessage, privateKey)

  return {
    signature: signature.toString('base64'),
    pub_key: {
      type: `tendermint/PubKeySecp256k1`, // TODO: allow other keytypes
      value: publicKey.toString('base64')
    }
  }
}

// adds the signature object to the tx
export function getSignedTx(tx: StandardTx, signature: Signature): SignedTx {
  return Object.assign({}, tx, {
    signatures: [signature]
  })
}

// the broadcast body consists of the signed tx and a return type
// this body can be posted to any Stargate (Cosmos SDK REST API) to the endpoint `/txs`
enum TxBroadcastReturnType {
  Block = 'block',
  Sync = 'sync',
  Async = 'async'
}
export function getBroadcastBody(
  signedTx: SignedTx,
  returnType: TxBroadcastReturnType = TxBroadcastReturnType.Block
) {
  return JSON.stringify({
    tx: signedTx,
    return: returnType
  })
}

// sign and send a tx to a Stargate (Cosmos SDK REST API)
// export function send(tx: StandardTx, requestMetaData: RequestMetaData, keyPair: KeyPair, stargateURL: string, returnType: TxBroadcastReturnType) {
//   const signature = getSignature(tx, keyPair, requestMetaData)
//   const signedTx = getSignedTx(tx, signature)
//   const broadcastTx = getBroadcastBody(signedTx, returnType)

//   fetch(`${stargateURL}/txs`, {
//     method: "POST",
//     url: `${stargateURL}/txs`
//   })
// }
