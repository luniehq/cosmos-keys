export interface BIP32 {
  derivePath(hdPath: string): { privateKey: Buffer }
}
export interface KeyPair {
  privateKey: Buffer
  publicKey: Buffer
}
export interface Wallet extends KeyPair {
  cosmosAddress: string
}
export interface Coin {
  denom: string
  amount: string
}
export interface Fee {
  amount: Coin[]
  gas: string
}
export interface StandardTx {
  fee: Fee
  memo: string
  msg: any // the content of the tx
}
export interface StdSignMsg {
  chain_id: string
  account_number: string
  sequence: string
  fee: Fee
  msgs: any[]
  memo: string
}
export interface RequestMetaData {
  sequence: string
  account_number: string
  chain_id: string
}
export interface Signature {
  signature: string
  pub_key: {
    type: `tendermint/PubKeySecp256k1`
    value: string
  }
}
export interface SignedTx extends StandardTx {
  signatures: Signature[]
}
