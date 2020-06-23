import {
  randomBytes,
  getCosmosAddress,
  getNewWalletFromSeed,
  getSeed,
  getNewWallet,
  signWithPrivateKey,
  verifySignature,
} from '../src/cosmos-keys'

describe(`Key Generation`, () => {
  it(`randomBytes browser`, () => {
    const crypto = require('crypto')
    const window = {
      crypto: {
        getRandomValues: (array: any[]) => crypto.randomBytes(array.length),
      },
    }
    expect(randomBytes(32, <Window>window).length).toBe(32)
  })

  it(`randomBytes node`, () => {
    expect(randomBytes(32).length).toBe(32)
  })

  it(`randomBytes unsecure environment`, () => {
    jest.doMock('crypto', () => null)

    expect(() => randomBytes(32)).toThrow()
  })

  it(`should create a wallet from a seed`, async () => {
    expect(await getNewWalletFromSeed(`a b c`, 'cosmos')).toEqual({
      cosmosAddress: `cosmos1pt9904aqg739q6p9kgc2v0puqvj6atp0zsj70g`,
      privateKey: `a9f1c24315bf0e366660a26c5819b69f242b5d7a293fc5a3dec8341372544be8`,
      publicKey: `037a525043e79a9051d58214a9a2a70b657b3d49124dcd0acc4730df5f35d74b32`,
      seedPhrase: `a b c`,
    })
    expect(await getNewWalletFromSeed(`a b c`, 'mesgtest', "44'/470'/0'/0/0")).toEqual({
      cosmosAddress: `mesgtest1wna6lpw7e2yv9u2vxw4zl5vg223yf56fuadzsa`,
      privateKey: `bab0764add9eaa7a9a61fdb61c3cd80404bf912543079fe6edcb36ec3b9c21d7`,
      publicKey: `02eb47a78f460f91a481ddfdf5f5fa7979389d7c994e92e58d9f2b88af2dcf1866`,
      seedPhrase: `a b c`,
    })
  })

  it(`create a seed`, () => {
    expect(getSeed(() => Buffer.from(Array(64).fill(0).join(``), 'hex'))).toBe(
      `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`
    )
  })

  it(`create a random wallet`, () => {
    expect(getNewWallet(() => Buffer.from(Array(64).fill(0).join(``), 'hex'), 'cosmos')).toEqual({
      cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`,
      privateKey: `8088c2ed2149c34f6d6533b774da4e1692eb5cb426fdbaef6898eeda489630b7`,
      publicKey: `02ba66a84cf7839af172a13e7fc9f5e7008cb8bca1585f8f3bafb3039eda3c1fdd`,
      seedPhrase: expect.stringContaining(''),
    })
  })

  it(`throws an error if entropy function is not producing correct bytes`, () => {
    expect(() => getSeed(() => Buffer.from(Array(10).fill(0).join(``), 'hex'))).toThrow()
  })
})

describe(`Address generation`, () => {
  it(`should create correct cosmos addresses`, () => {
    const vectors = [
      {
        pubkey: `52FDFC072182654F163F5F0F9A621D729566C74D10037C4D7BBB0407D1E2C64981`,
        address: `cosmos1v3z3242hq7xrms35gu722v4nt8uux8nvug5gye`,
        prefix: `cosmos`,
      },
      {
        pubkey: `855AD8681D0D86D1E91E00167939CB6694D2C422ACD208A0072939487F6999EB9D`,
        address: `terra1hrtz7umxfyzun8v2xcas0v45hj2uhp6swfma68`,
        prefix: `terra`,
      },
    ]
    vectors.forEach(({ pubkey, address, prefix }) => {
      expect(getCosmosAddress(Buffer.from(pubkey, 'hex'), prefix)).toBe(address)
    })
  })
})

describe(`Signing`, () => {
  it(`should create a correct signature`, () => {
    const vectors = [
      {
        privateKey: `2afc5a66b30e7521d553ec8e6f7244f906df97477248c30c103d7b3f2c671fef`,
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
                    coins: [{ amount: '1', denom: 'STAKE' }],
                  },
                ],
                outputs: [
                  {
                    address: 'cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt',
                    coins: [{ amount: '1', denom: 'STAKE' }],
                  },
                ],
              },
            },
          ],
          sequence: '0',
        },
        signature: `YjJhlAf7aCnUtLyBNDp9e6LKuNgV7hJC3rmm0Wro5nBsIPVtWzjuobsp/AhR5Kht+HcRF2zBq4AfoNQMIbY6fw==`,
      },
    ]

    vectors.forEach(({ privateKey, signMessage, signature: expectedSignature }) => {
      const signature = signWithPrivateKey(signMessage, Buffer.from(privateKey, 'hex'))
      expect(signature.toString('base64')).toEqual(expectedSignature)
    })
  })
})

describe(`Verifying`, () => {
  it(`should verify a signature`, () => {
    const vectors = [
      {
        publicKey: `03ab1ebbb21aee35154e36aaebc25067177f783f7e967c9d6493e8920c05e40eb5`,
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
                    coins: [{ amount: '1', denom: 'STAKE' }],
                  },
                ],
                outputs: [
                  {
                    address: 'cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt',
                    coins: [{ amount: '1', denom: 'STAKE' }],
                  },
                ],
              },
            },
          ],
          sequence: '0',
        },
        signature: `YjJhlAf7aCnUtLyBNDp9e6LKuNgV7hJC3rmm0Wro5nBsIPVtWzjuobsp/AhR5Kht+HcRF2zBq4AfoNQMIbY6fw==`,
      },
    ]

    vectors.forEach(({ publicKey, signMessage, signature }) => {
      const publicKeyBuffer = Buffer.from(publicKey, 'hex')
      const signatureBuffer = Buffer.from(signature, 'base64')
      expect(verifySignature(signMessage, signatureBuffer, publicKeyBuffer)).toEqual(true)
    })
  })

  it(`should fail on invalid signature`, () => {
    const publicKey = Buffer.from(
      `03ab1ebbb21aee35154e36aaebc25067177f783f7e967c9d6493e8920c05e40eb5`,
      'hex'
    )
    const signature = Buffer.from(
      `YjJhlAf7aCnUtLyBNDp9e6LKuNgV7hJC3rmm0Wro5nBsIPVtWzjuobsp/AhR5Kht+HcRF2zBq4AfoNQMIbY6fw==`,
      'base64'
    )
    expect(verifySignature('abcdefg', signature, publicKey)).toEqual(false)
  })
})
