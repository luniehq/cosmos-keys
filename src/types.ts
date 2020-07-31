export interface KeyPair {
  privateKey: Buffer
  publicKey: Buffer
}
export interface Wallet {
  privateKey: string
  publicKey: string
  cosmosAddress: string
  seedPhrase: string
}
export interface StoredWallet {
  name: string
  address: string
  wallet: string // encrypted wallet
  network: string
  HDPath: string
  curve: string
}
export interface WalletIndex {
  name: string
  address: string
  network?: string // not stored, but enriched with
  HDPath?: string // not stored, but enriched with
  curve?: string // not stored, but enriched with
}
export interface Coin {
  denom: string
  amount: string
}
export interface Fee {
  amount: Coin[]
  gas: string
}
export interface StdSignMsg {
  chain_id: string
  account_number: string
  sequence: string
  fee: Fee
  msgs: any[]
  memo: string
}
