import {
  getCosmosAddress,
  getSignatureObject,
  getSignature,
  getSignMessage,
  getWalletFromSeed,
  getSeed,
  getWallet,
  getSignedTx,
  getBroadcastBody,
  signWithPrivateKey
} from '../src/js-cosmos-wallet'

describe(`Key Generation`, () => {
  it(`should create a wallet from a seed`, async () => {
    expect(await getWalletFromSeed(`a b c`)).toEqual({
      cosmosAddress: `cosmos1pt9904aqg739q6p9kgc2v0puqvj6atp0zsj70g`,
      privateKey: `a9f1c24315bf0e366660a26c5819b69f242b5d7a293fc5a3dec8341372544be8`,
      publicKey: `037a525043e79a9051d58214a9a2a70b657b3d49124dcd0acc4730df5f35d74b32`
    })
  })

  it(`create a seed`, () => {
    expect(
      getSeed(() =>
        Buffer.from(
          Array(64)
            .fill(0)
            .join(``),
          'hex'
        )
      )
    ).toBe(
      `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`
    )
  })

  it(`create a random wallet`, () => {
    expect(
      getWallet(() =>
        Buffer.from(
          Array(64)
            .fill(0)
            .join(``),
          'hex'
        )
      )
    ).toEqual({
      cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`,
      privateKey: `8088c2ed2149c34f6d6533b774da4e1692eb5cb426fdbaef6898eeda489630b7`,
      publicKey: `02ba66a84cf7839af172a13e7fc9f5e7008cb8bca1585f8f3bafb3039eda3c1fdd`
    })
  })

  it(`throws an error if entropy function is not producing correct bytes`, () => {
    expect(() =>
      getSeed(() =>
        Buffer.from(
          Array(10)
            .fill(0)
            .join(``),
          'hex'
        )
      )
    ).toThrow()
  })
})

describe(`Address generation`, () => {
  it(`should create correct cosmos addresses`, () => {
    const vectors = [
      {
        pubkey: `52FDFC072182654F163F5F0F9A621D729566C74D10037C4D7BBB0407D1E2C64981`,
        address: `cosmos1v3z3242hq7xrms35gu722v4nt8uux8nvug5gye`
      },
      {
        pubkey: `855AD8681D0D86D1E91E00167939CB6694D2C422ACD208A0072939487F6999EB9D`,
        address: `cosmos1hrtz7umxfyzun8v2xcas0v45hj2uhp6sgdpac8`
      }
    ]
    vectors.forEach(({ pubkey, address }) => {
      expect(getCosmosAddress(pubkey)).toBe(address)
    })
  })
})

describe(`Signing`, () => {
  const tx = {
    msg: [
      {
        type: `cosmos-sdk/Send`,
        value: {
          inputs: [
            {
              address: `cosmos1qperwt9wrnkg5k9e5gzfgjppzpqhyav5j24d66`,
              coins: [{ denom: `STAKE`, amount: `1` }]
            }
          ],
          outputs: [
            {
              address: `cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt`,
              coins: [{ denom: `STAKE`, amount: `1` }]
            }
          ]
        }
      }
    ],
    fee: { amount: [{ denom: ``, amount: `0` }], gas: `21906` },
    signatures: null,
    memo: ``
  }
  const txWithNulls = {
    msg: [
      {
        type: `cosmos-sdk/Send`,
        value: {
          inputs: [
            {
              address: `cosmos1qperwt9wrnkg5k9e5gzfgjppzpqhyav5j24d66`,
              coins: [{ denom: `STAKE`, amount: `1` }]
            }
          ],
          outputs: [
            {
              x: undefined,
              address: `cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt`,
              coins: [{ denom: `STAKE`, amount: `1` }]
            }
          ]
        }
      }
    ],
    fee: { amount: [{ denom: ``, amount: `0` }], gas: `21906` },
    signatures: null,
    memo: ``
  }

  it(`should create an Object containing the signature and pubkey`, () => {
    const vectors = [
      {
        signature: `MEQCIE2f8y5lVAOZu/MDZX3aH+d0sgvTRVrEzdP60NHr7lKJAiBexCiaAsh35R25IhgJMBIp/AD2Lfuk57suV8gnqOSfzg==`,
        publicKey: `A6seu7Ia7jUVTjaq68JQZxd/eD9+lnydZJPokgwF5A61`
      },
      {
        signature: `MEQCIE2f8y5lVAOZu/MDZX3aH+d0sgvTRVrEzdP60NHr7lKJAiBexCiaAsh35R25IhgJMBIp/AD2Lfuk57suV8gnqOSfzg==`,
        publicKey: `AkMxFYmvY8Kt2gT813ksA4oFwSpP5ANRs+sWEv9rLloO`
      }
    ]

    vectors.forEach(({ signature, publicKey }) =>
      expect(
        getSignatureObject(Buffer.from(signature, 'base64'), Buffer.from(publicKey, 'base64'))
      ).toMatchObject({
        signature,
        pub_key: {
          type: `tendermint/PubKeySecp256k1`,
          value: publicKey
        }
      })
    )
  })

  it(`should create the correct message to sign`, () => {
    const vectors = [
      {
        tx,
        sequence: `0`,
        account_number: `1`,
        chain_id: `tendermint_test`,
        signMessage: {
          account_number: '1',
          chain_id: 'tendermint_test',
          fee: { amount: [{ amount: '0', denom: '' }], gas: '21906' },
          memo: '',
          msgs: [
            {
              type: 'cosmos-sdk/Send',
              value: {
                inputs: [
                  {
                    address: 'cosmos1qperwt9wrnkg5k9e5gzfgjppzpqhyav5j24d66',
                    coins: [{ amount: '1', denom: 'STAKE' }]
                  }
                ],
                outputs: [
                  {
                    address: 'cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt',
                    coins: [{ amount: '1', denom: 'STAKE' }]
                  }
                ]
              }
            }
          ],
          sequence: '0'
        }
      },
      {
        tx: txWithNulls,
        sequence: `0`,
        account_number: `1`,
        chain_id: `tendermint_test`,
        signMessage: {
          account_number: '1',
          chain_id: 'tendermint_test',
          fee: { amount: [{ amount: '0', denom: '' }], gas: '21906' },
          memo: '',
          msgs: [
            {
              type: 'cosmos-sdk/Send',
              value: {
                inputs: [
                  {
                    address: 'cosmos1qperwt9wrnkg5k9e5gzfgjppzpqhyav5j24d66',
                    coins: [{ amount: '1', denom: 'STAKE' }]
                  }
                ],
                outputs: [
                  {
                    address: 'cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt',
                    coins: [{ amount: '1', denom: 'STAKE' }]
                  }
                ]
              }
            }
          ],
          sequence: '0'
        }
      }
    ]

    vectors.forEach(({ tx, sequence, account_number, chain_id, signMessage }) => {
      expect(getSignMessage(tx, { sequence, account_number, chain_id })).toEqual(signMessage)
    })
  })

  it(`should create a correct tx signature object`, () => {
    const vectors = [
      {
        wallet: {
          privateKey: Buffer.from(
            `2afc5a66b30e7521d553ec8e6f7244f906df97477248c30c103d7b3f2c671fef`,
            'hex'
          ),
          publicKey: Buffer.from(
            `03ab1ebbb21aee35154e36aaebc25067177f783f7e967c9d6493e8920c05e40eb5`,
            'hex'
          )
        },
        tx,
        signature: `YjJhlAf7aCnUtLyBNDp9e6LKuNgV7hJC3rmm0Wro5nBsIPVtWzjuobsp/AhR5Kht+HcRF2zBq4AfoNQMIbY6fw==`,
        sequence: `0`,
        account_number: `1`,
        chain_id: `tendermint_test`,
        pub_key: {
          type: `tendermint/PubKeySecp256k1`,
          value: `A6seu7Ia7jUVTjaq68JQZxd/eD9+lnydZJPokgwF5A61`
        }
      }
    ]

    vectors.forEach(
      ({
        wallet,
        tx,
        pub_key: expectedPubKey,
        signature: expectedSignature,
        sequence,
        account_number,
        chain_id
      }) => {
        const sigObject = getSignature(tx, wallet, {
          sequence,
          account_number,
          chain_id
        })
        expect(sigObject).toEqual({
          signature: expectedSignature,
          pub_key: expectedPubKey
        })
      }
    )
  })

  it(`attaches a signature`, () => {
    const tx = <StandardTx>{}
    const sig = <Signature>{ signature: '1' }
    expect(getSignedTx(tx, sig)).toEqual({
      signatures: [{ signature: '1' }]
    })
  })

  it(`creates a broadcast body`, () => {
    const signedTx = <SignedTx>{ signatures: [{ signature: '1' }] }
    expect(getBroadcastBody(signedTx)).toEqual(
      JSON.stringify({
        tx: { signatures: [{ signature: '1' }] },
        return: `block`
      })
    )
  })
})
