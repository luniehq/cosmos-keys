declare interface KeyPair {
  privateKey: Buffer
  publicKey: Buffer
}
declare interface Wallet extends KeyPair {
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
declare interface StandardTx {
  fee: Fee
  memo: string
  msg: any // the content of the tx
}
declare interface StdSignMsg {
  chain_id: string
  account_number: string
  sequence: string
  fee: Fee
  msgs: any[]
  memo: string
}
declare interface RequestMetaData {
  sequence: string
  account_number: string
  chain_id: string
}
declare interface Signature {
  signature: string
  pub_key: {
    type: `tendermint/PubKeySecp256k1`
    value: string
  }
}
declare interface SignedTx extends StandardTx {
  signatures: Signature[]
}
