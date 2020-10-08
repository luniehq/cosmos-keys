import { Wallet, StoredWallet, StoredSeed, WalletIndex } from './types'

const CryptoJS = require('crypto-js')

/*
 * This module assists in storing wallets encrypted in localstorage.
 * Wallets are stored by address to prevent accidental overwrite.
 * Loading and removal are protected by password checks.
 * This module also stores an index of all wallets by name for easy querying,
 * i.e. to show all wallets available.
 */

const KEY_TAG = `cosmos-wallets`

const keySize = 256
const iterations = 100

// loads and decrypts a wallet from localstorage
export function getStoredWallet(address: string, password: string): Wallet {
  const storedWallet = loadFromStorage(address)
  if (!storedWallet) {
    throw new Error('No wallet found for requested address')
  }

  try {
    const decrypted = decrypt(storedWallet.wallet, password)
    const wallet = JSON.parse(decrypted)

    return wallet
  } catch (err) {
    throw new Error(`Incorrect password`)
  }
}

export function getStoredSeedFromName(name: string, password: string): string {
  const storedSeed = loadSeedFromStorage(name)
  if (!storedSeed) {
    throw new Error('No wallet found for requested address')
  }

  try {
    const decrypted = decrypt(storedSeed.seed, password)
    const seed = JSON.parse(decrypted)

    return seed
  } catch (err) {
    throw new Error(`Incorrect password`)
  }
}

// store a wallet encrypted in localstorage
export function storeWallet(
  wallet: Wallet,
  name: string,
  password: string,
  network: string,
  HDPath: string = `m/44'/118'/0'/0/0`, // default
  curve: string = `ed25519` // default
): void {
  const storedWallet = loadFromStorage(wallet.cosmosAddress)
  if (storedWallet) {
    throw new Error("The wallet was already stored. Can't store the same wallet again.")
  }

  const ciphertext = encrypt(JSON.stringify(wallet), password)
  addToStorage(name, wallet.cosmosAddress, ciphertext, network, HDPath, curve)
}

// store a wallet encrypted in localstorage
export function removeWallet(address: string, password: string): void {
  const storedWallet = loadFromStorage(address)
  if (!storedWallet) throw new Error('No wallet found for requested address')

  // make sure the user really wants to delete the wallet
  // throws if password is incorrect
  testPassword(address, password)

  removeFromStorage(address)
}

export function storeSeed(
  seed: string,
  name: string,
  password: string,
): void {
  const storedSeed = loadFromStorage(seed)
  if (storedSeed) {
    throw new Error("The wallet was already stored. Can't store the same wallet again.")
  }

  const ciphertext = encrypt(JSON.stringify(seed), password)
  addSeedToStorage(name, seed, ciphertext)
}

// test password by trying to decrypt a key with said password
export function testPassword(address: string, password: string) {
  const storedWallet = loadFromStorage(address)
  if (!storedWallet) {
    throw new Error('No wallet found for request address')
  }

  try {
    // try to decode and check if is json format to proof that decoding worked
    const decrypted = decrypt(storedWallet.wallet, password)
    JSON.parse(decrypted)
  } catch (err) {
    throw new Error('Password for wallet is incorrect')
  }
}

// returns the index of the stored wallets
export function getWalletIndex(enriched: Boolean = true): WalletIndex[] {
  let wallets = JSON.parse(localStorage.getItem(KEY_TAG + '-index') || '[]')
  if (enriched) {
    // add network data to index
    return wallets.map((wallet: WalletIndex) => {
      const walletData = loadFromStorage(wallet.address)
      if (walletData && walletData.network) {
        // enrich with network data
        wallet.network = walletData.network
        wallet.HDPath = walletData.HDPath
        wallet.curve = walletData.curve
      }
      return wallet
    })
  }
  return wallets
}

// loads an encrypted wallet from localstorage
function loadFromStorage(address: string): StoredWallet | null {
  const storedKey = localStorage.getItem(KEY_TAG + '-' + address)
  if (!storedKey) {
    return null
  }
  return JSON.parse(storedKey)
}

// loads an encrypted seed from localstorage
function loadSeedFromStorage(name: string): StoredSeed | null {
  const storedKey = localStorage.getItem(KEY_TAG + '-' + name)
  if (!storedKey) {
    return null
  }
  return JSON.parse(storedKey)
}

// stores an encrypted wallet in localstorage
function addToStorage(
  name: string,
  address: string,
  ciphertext: string,
  network: string,
  HDPath: string,
  curve: string
): void {
  addToIndex(name, address)

  const storedWallet: StoredWallet = {
    name,
    address,
    wallet: ciphertext,
    network,
    HDPath,
    curve,
  }

  localStorage.setItem(KEY_TAG + '-' + address, JSON.stringify(storedWallet))
}

// stores an encrypted wallet in localstorage
function addSeedToStorage(name: string, seed: string, ciphertext: string): void {
  addToIndex(name, seed)

  const storedSeed: StoredSeed = {
    name,
    seed
  }

  localStorage.setItem(KEY_TAG + '-' + name, JSON.stringify(storedSeed))
}

// removed a wallet from localstorage
export function removeFromStorage(address: string): void {
  removeFromIndex(address)
  localStorage.removeItem(KEY_TAG + '-' + address)
}

// stores the names of the keys to prevent name collision
function addToIndex(name: string, address: string): void {
  const storedIndex = getWalletIndex(false)

  if (storedIndex.find(({ name: storedName }) => name === storedName)) {
    throw new Error(`Key with that name already exists`)
  }

  storedIndex.push({ name, address })
  localStorage.setItem(KEY_TAG + '-index', JSON.stringify(storedIndex))
}

function removeFromIndex(address: string): void {
  const storedIndex = getWalletIndex(false)

  const updatedIndex = storedIndex.filter(({ address: storedAddress }) => storedAddress !== address)
  localStorage.setItem(KEY_TAG + '-index', JSON.stringify(updatedIndex))
}

function encrypt(message: string, password: string): string {
  const salt = CryptoJS.lib.WordArray.random(128 / 8)

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: keySize / 32,
    iterations: iterations,
  })

  const iv = CryptoJS.lib.WordArray.random(128 / 8)

  const encrypted = CryptoJS.AES.encrypt(message, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  })

  // salt, iv will be hex 32 in length
  // append them to the ciphertext for use  in decryption
  const transitmessage = salt.toString() + iv.toString() + encrypted.toString()
  return transitmessage
}

function decrypt(transitMessage: string, password: string): string {
  const salt = CryptoJS.enc.Hex.parse(transitMessage.substr(0, 32))
  const iv = CryptoJS.enc.Hex.parse(transitMessage.substr(32, 32))
  const encrypted = transitMessage.substring(64)

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: keySize / 32,
    iterations: iterations,
  })

  const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  }).toString(CryptoJS.enc.Utf8)
  return decrypted
}
