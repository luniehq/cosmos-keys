declare interface KeyPair {
  privateKey: Buffer
  publicKey: Buffer
}
declare interface Wallet {
  privateKey: string
  publicKey: string
  cosmosAddress: string
}
declare interface Coin {
  denom: string
  amount: string
}
declare interface Fee {
  amount: Coin[]
  gas: string
}
declare interface StdSignMsg {
  chain_id: string
  account_number: string
  sequence: string
  fee: Fee
  msgs: any[]
  memo: string
}
