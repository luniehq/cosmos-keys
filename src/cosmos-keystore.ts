/// <reference path="cosmos-keys.d.ts" />

const CryptoJS = require('crypto-js')

const KEY_TAG = `cosmos-wallets`

const keySize = 256
const iterations = 100

// loads an encrypted wallet from localstorage
function loadFromStorage(address: string): StoredWallet | null {
  const storedKey = localStorage.getItem(KEY_TAG + '-' + address)
  if (!storedKey) {
    return null
  }
  return JSON.parse(storedKey)
}

// stores an encrypted wallet in localstorage
function addToStorage(name: string, address: string, ciphertext: string): void {
  const storedWallet: StoredWallet = {
    name,
    address,
    wallet: ciphertext
  }

  localStorage.setItem(KEY_TAG + '-' + address, JSON.stringify(storedWallet))
}

// loads and decrypts a wallet from localstorage
export function getStoredWallet(address: string, password: string): Wallet {
  const storedWallet = loadFromStorage(address)
  if (!storedWallet) {
    throw new Error('No wallet found for request address')
  }

  try {
    const decrypted = decrypt(storedWallet.wallet, password)
    const wallet = JSON.parse(decrypted)

    return wallet
  } catch (err) {
    throw new Error(`Incorrect password`)
  }
}

// stores the names of the keys to prevent name collision
function updateIndex(name: string): void {
  if (name.includes(',')) throw new Error("Name can't include a ','")

  const storedIndex = (localStorage.getItem(KEY_TAG + '-index') || '').split(',').filter(x => !!x)

  if (storedIndex.includes(name)) throw new Error(`Key with that name already exists`)

  const updatedIndex = storedIndex.concat(name).join(',')
  localStorage.setItem(KEY_TAG + '-index', updatedIndex)
}

// store a wallet encrypted in localstorage
export function storeWallet(wallet: Wallet, name: string, password: string): void {
  const storedWallet = loadFromStorage(wallet.cosmosAddress)
  if (storedWallet)
    throw new Error("The wallet was already stored. Can't store the same wallet again.")

  updateIndex(name)

  const ciphertext = encrypt(JSON.stringify(wallet), password)
  addToStorage(name, wallet.cosmosAddress, ciphertext)
}

// test password by trying to decrypt a key with said password
export function testPassword(address: string, password: string): Boolean {
  const storedWallet = loadFromStorage(address)
  if (!storedWallet) {
    throw new Error('No wallet found for request address')
  }

  try {
    // try to decode and check if is json format to proof that decoding worked
    const decrypted = decrypt(storedWallet.wallet, password)
    JSON.parse(decrypted)
    return true
  } catch (err) {
    return false
  }
}

function encrypt(message: string, password: string): string {
  const salt = CryptoJS.lib.WordArray.random(128 / 8)

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: keySize / 32,
    iterations: iterations
  })

  const iv = CryptoJS.lib.WordArray.random(128 / 8)

  const encrypted = CryptoJS.AES.encrypt(message, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
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
    iterations: iterations
  })

  const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  }).toString(CryptoJS.enc.Utf8)
  return decrypted
}
