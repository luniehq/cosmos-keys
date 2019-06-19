/// <reference path="cosmos-keys.d.ts" />

import * as bip39 from 'bip39'
import * as bip32 from 'bip32'
import * as bech32 from 'bech32'
import * as secp256k1 from 'secp256k1'
import * as CryptoJS from 'crypto-js'

const hdPathAtom = `m/44'/118'/0'/0/0` // key controlling ATOM allocation

// returns a byte buffer of the size specified
export function randomBytes(size: number): Buffer {
  // in browsers
  if (typeof window !== 'undefined' && window.crypto) {
    return windowRandomBytes(size)
  }

  try {
    // native node crypto
    const crypto = require('crypto');
    return crypto.randomBytes(size)
  } catch (err) {
    // no native node crypto available
  }

  throw new Error("There is no native support for random bytes on this system. Key generation is not safe here.")
}

export function getNewWalletFromSeed(mnemonic: string): Wallet {
  const masterKey = deriveMasterKey(mnemonic)
  const { privateKey, publicKey } = deriveKeypair(masterKey)
  const cosmosAddress = getCosmosAddress(publicKey)
  return {
    privateKey: privateKey.toString('hex'),
    publicKey: publicKey.toString('hex'),
    cosmosAddress
  }
}

export function getSeed(randomBytesFunc: (size: number) => Buffer = randomBytes): string {
  const entropy = randomBytesFunc(32)
  if (entropy.length !== 32) throw Error(`Entropy has incorrect length`)
  const mnemonic = bip39.entropyToMnemonic(entropy.toString('hex'))

  return mnemonic
}

export function getNewWallet(randomBytesFunc: (size: number) => Buffer = randomBytes): Wallet {
  const mnemonic = getSeed(randomBytesFunc)
  return getNewWalletFromSeed(mnemonic)
}

// NOTE: this only works with a compressed public key (33 bytes)
export function getCosmosAddress(publicKey: Buffer): string {
  const message = CryptoJS.enc.Hex.parse(publicKey.toString('hex'))
  const address = CryptoJS.RIPEMD160(CryptoJS.SHA256(message) as any).toString()
  const cosmosAddress = bech32ify(address, `cosmos`)

  return cosmosAddress
}

function deriveMasterKey(mnemonic: string): bip32.BIP32 {
  // throws if mnemonic is invalid
  bip39.validateMnemonic(mnemonic)

  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const masterKey = bip32.fromSeed(seed)
  return masterKey
}

function deriveKeypair(masterKey: bip32.BIP32): KeyPair {
  const cosmosHD = masterKey.derivePath(hdPathAtom)
  const privateKey = cosmosHD.privateKey
  const publicKey = secp256k1.publicKeyCreate(privateKey, true)

  return {
    privateKey,
    publicKey
  }
}

// converts a string to a bech32 version of that string which shows a type and has a checksum
function bech32ify(address: string, prefix: string) {
  const words = bech32.toWords(Buffer.from(address, 'hex'))
  return bech32.encode(prefix, words)
}

// produces the signature for a message (returns Buffer)
export function signWithPrivateKey(signMessage: StdSignMsg | string, privateKey: Buffer): Buffer {
  const signMessageString: string =
    typeof signMessage === 'string' ? signMessage : JSON.stringify(signMessage)
  const signHash = Buffer.from(CryptoJS.SHA256(signMessageString).toString(), `hex`)
  const { signature } = secp256k1.sign(signHash, privateKey)

  return signature
}

function windowRandomBytes(size: number) {
  const chunkSize = size / 4
  let hexString = ''
  let keyContainer = new Uint32Array(chunkSize)
  keyContainer = window.crypto.getRandomValues(keyContainer)

  for (let keySegment = 0; keySegment < keyContainer.length; keySegment++) {
    let chunk = keyContainer[keySegment].toString(16) // Convert int to hex
    while (chunk.length < chunkSize) {
      // fill up so we get equal sized chunks
      chunk = '0' + chunk
    }
    hexString += chunk // join
  }
  return Buffer.from(hexString, 'hex')
}