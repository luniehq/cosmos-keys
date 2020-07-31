import {
  testPassword,
  getStoredWallet,
  storeWallet,
  removeWallet,
  getWalletIndex,
} from '../src/cosmos-keystore'

const mockWallet = {
  cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`,
  seedPhrase: `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`,
  privateKey: `8088c2ed2149c34f6d6533b774da4e1692eb5cb426fdbaef6898eeda489630b7`,
  publicKey: `02ba66a84cf7839af172a13e7fc9f5e7008cb8bca1585f8f3bafb3039eda3c1fdd`,
  network: `cosmos-hub-testnet`,
}
const mockWallet2 = Object.assign({}, mockWallet, {
  cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mh2`,
})
const mockWallet3 = Object.assign({}, mockWallet, {
  cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mh3`,
})
const mockWallet4 = Object.assign({}, mockWallet, {
  cosmosAddress: `xrn:1h0y77r8ee28hs0wqg9css7rzegmagaamwl6rdp`,
})

describe(`Keystore`, () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it(`stores a wallet`, () => {
    storeWallet(
      mockWallet,
      'mock-name',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    expect(
      localStorage.getItem(`cosmos-wallets-cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`)
    ).toBeDefined()
  })

  it(`check if network is set`, () => {
    storeWallet(
      mockWallet4,
      'mock-name4',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    expect(
      localStorage.getItem(`cosmos-wallets-xrn:1h0y77r8ee28hs0wqg9css7rzegmagaamwl6rdp`)
    ).toBeDefined()
    const wallet = JSON.parse(
      localStorage.getItem(`cosmos-wallets-xrn:1h0y77r8ee28hs0wqg9css7rzegmagaamwl6rdp`) || '{}'
    )
    expect(wallet.network).toEqual('regen-testnet')
  })

  it(`stores a collection of wallet names to prevent name collision`, () => {
    storeWallet(
      mockWallet,
      'mock-name',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    storeWallet(
      mockWallet2,
      'mock-name2',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    storeWallet(
      mockWallet3,
      'mock-name3',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    expect(JSON.parse(localStorage.getItem(`cosmos-wallets-index`) || '[]')).toEqual([
      {
        name: `mock-name`,
        address: mockWallet.cosmosAddress,
      },
      {
        name: `mock-name2`,
        address: mockWallet2.cosmosAddress,
      },
      {
        name: `mock-name3`,
        address: mockWallet3.cosmosAddress,
      },
    ])
  })

  it(`prevents you from adding a wallet with the same name twice`, () => {
    storeWallet(
      mockWallet,
      'mock-name',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    expect(() =>
      storeWallet(
        mockWallet2,
        'mock-name',
        'mock-password2',
        'regen-testnet',
        `m/44'/118'/0'/0/0`,
        'ed25519'
      )
    ).toThrow()

    expect(JSON.parse(localStorage.getItem(`cosmos-wallets-index`) || '[]')).toEqual([
      {
        name: `mock-name`,
        address: mockWallet.cosmosAddress,
      },
    ])
  })

  it(`loads a stored wallet`, () => {
    storeWallet(
      mockWallet,
      'mock-name',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    const key = getStoredWallet(mockWallet.cosmosAddress, 'mock-password')
    expect(key.privateKey).toBe(mockWallet.privateKey)
  })

  it(`signals if there is no stored wallet for an address`, () => {
    expect(() => getStoredWallet(mockWallet.cosmosAddress, 'mock-password')).toThrow()
  })

  it(`signals if the password for the stored wallet is incorrect`, () => {
    storeWallet(
      mockWallet,
      'mock-name',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    expect(() => getStoredWallet(mockWallet.cosmosAddress, 'wrong-password')).toThrow()
  })

  it(`tests if a password is correct for a localy stored key`, () => {
    storeWallet(
      mockWallet,
      'mock-name',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    expect(() => testPassword(mockWallet.cosmosAddress, 'mock-password')).not.toThrow()
    expect(() => testPassword(mockWallet.cosmosAddress, 'wrong-password')).toThrow()
  })

  it(`throws if wallet to test password for is not existent for better error output`, () => {
    expect(() => testPassword(mockWallet.cosmosAddress, 'mock-password')).toThrow()
  })

  it(`prevents you from overwriting existing key names`, () => {
    storeWallet(
      mockWallet,
      'mock-name',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    expect(() =>
      storeWallet(
        mockWallet,
        'mock-name',
        'mock-password',
        'regen-testnet',
        `m/44'/118'/0'/0/0`,
        'ed25519'
      )
    ).toThrow()
  })

  it(`prevents you from overwriting existing wallets`, () => {
    storeWallet(
      mockWallet,
      'mock-name',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    expect(() =>
      storeWallet(
        mockWallet,
        'mock-name2',
        'mock-password',
        'regen-testnet',
        `m/44'/118'/0'/0/0`,
        'ed25519'
      )
    ).toThrow()
  })

  it(`removes a wallet`, () => {
    storeWallet(
      mockWallet,
      'mock-name',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    storeWallet(
      mockWallet2,
      'mock-name2',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    removeWallet(mockWallet.cosmosAddress, 'mock-password')
    expect(() => getStoredWallet(mockWallet.cosmosAddress, 'mock-password')).toThrow()
    expect(JSON.parse(localStorage.getItem(`cosmos-wallets-index`) || '[]')).toEqual([
      {
        name: `mock-name2`,
        address: mockWallet2.cosmosAddress,
      },
    ])
  })

  it(`throws if the password for a wallet while removing is incorrect`, () => {
    storeWallet(
      mockWallet,
      'mock-name',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    expect(() => removeWallet(mockWallet.cosmosAddress, 'wrong-password')).toThrow()
    expect(() => getStoredWallet(mockWallet.cosmosAddress, 'mock-password')).not.toThrow()
  })

  it(`gives an error if the wallet to remove doesn't exist for better error outputs`, () => {
    expect(() => removeWallet(mockWallet.cosmosAddress, 'mock-password')).toThrow()
  })

  it(`store index data and enrich it with network data`, () => {
    storeWallet(
      mockWallet,
      'mock-name',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    storeWallet(
      mockWallet2,
      'mock-name2',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    storeWallet(
      mockWallet3,
      'mock-name3',
      'mock-password',
      'regen-testnet',
      `m/44'/118'/0'/0/0`,
      'ed25519'
    )
    // get enriched version
    const wallets = getWalletIndex()
    const expectedValue = [
      {
        address: mockWallet2.cosmosAddress,
        name: 'mock-name2',
        network: 'regen-testnet',
        HDPath: "m/44'/118'/0'/0/0",
        curve: 'ed25519'
      },
    ]
    expect(wallets).toEqual(expect.arrayContaining(expectedValue))
  })
})
