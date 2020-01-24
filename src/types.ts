export interface KeyPair {
  privateKey: Buffer
  publicKey: Buffer
}
export interface Wallet {
  privateKey: string
  publicKey: string
  cosmosAddress: string
}
export interface StoredWallet {
  name: string
  address: string
  wallet: string // encrypted wallet
  network?: string
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
