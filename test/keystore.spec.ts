import { testPassword, getStoredWallet, storeWallet, removeWallet, getWalletIndex } from '../src/cosmos-keystore'

const mockWallet = {
  cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`,
  mnemonic: `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`,
  privateKey: `8088c2ed2149c34f6d6533b774da4e1692eb5cb426fdbaef6898eeda489630b7`,
  publicKey: `02ba66a84cf7839af172a13e7fc9f5e7008cb8bca1585f8f3bafb3039eda3c1fdd`,
  network: `cosmos-hub-testnet`
}
const mockWallet2 = Object.assign({}, mockWallet, {
  cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mh2`
})
const mockWallet3 = Object.assign({}, mockWallet, {
  cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mh3`
})
const mockWallet4 = Object.assign({}, mockWallet, {
  cosmosAddress: `xrn:1h0y77r8ee28hs0wqg9css7rzegmagaamwl6rdp`
})

describe(`Keystore`, () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it(`stores a wallet`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password', 'regen-testnet')
    expect(
      localStorage.getItem(`cosmos-wallets-cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`)
    ).toBeDefined()
  })

  it(`check if network is set`, () => {
    storeWallet(mockWallet4, 'mock-name4', 'mock-password', 'regen-testnet')
    expect(
      localStorage.getItem(`cosmos-wallets-xrn:1h0y77r8ee28hs0wqg9css7rzegmagaamwl6rdp`)
    ).toBeDefined()
    const wallet = JSON.parse(localStorage.getItem(`cosmos-wallets-xrn:1h0y77r8ee28hs0wqg9css7rzegmagaamwl6rdp`) || '{}')
    expect(wallet.network).toEqual('regen-testnet')
  })

  it(`stores a collection of wallet names to prevent name collision`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password', 'regen-testnet')
    storeWallet(mockWallet2, 'mock-name2', 'mock-password', 'regen-testnet')
    storeWallet(mockWallet3, 'mock-name3', 'mock-password', 'regen-testnet')
    expect(JSON.parse(localStorage.getItem(`cosmos-wallets-index`) || '[]')).toEqual([
      {
        name: `mock-name`,
        address: mockWallet.cosmosAddress,
        wallet: "9f8e614fc718b0c03d268bd53e57b5b067973961c27ec9a1c86e459bc6de2998fuhsVGoNsD2DLdHZF6QT+jab0fWbzFtknlTgaxSZxNjy9KQ7C33fwMnT8o2BrE40XN1eeyGY2L95ue5DV4N6blnJb1lSRTCdJBmMfCOiUZTnoMuqPL1Rfc9meK48QDl9ccbzwTcq28QEJO0B82k9m1d3nyzKRb3OpJR4qktN9gnxMH3tZAXEBPv3SuPx2uWoxBgZOiN7bZfoSQ36sMJfwj/xuqQcbvFse9asP+XgnX6g8ortj4pWDIVHaFmCUT4yvTXS1WHwNjmwJgjd78HWHq7+ao4dlm23JWD5v81y9uWD0UTEZ5EM1++F1ktUCuylZo/rZcoVeGnuo5ThddwGiXTYNYHCsK11xGv3TpNl4HX6G9F6dRpDjvWUApHRrTa4yROYAQIZl7lbN0bf1XFQodTGYMje2Q99o9AI366mhWwS9mLDQaRehacQEABHXK+OUZqsvFihQ0yuO7/f1um1MHdKgDsZ3j2e0KZbWh3+qqup15skct2fP/rUe30KC4T2C76+cCH8OTkgzevSinzOIAjJK18VumVkaUHY9sAViE2dZ1FiditGLJOJSEXuhxJ/FJOxPUFLET5fPTvHl6p/SbQGUM9VJXE4WtllOauxdCY="
      },
      {
        name: `mock-name2`,
        address: mockWallet2.cosmosAddress,
        wallet: "2d0b1b544da790ef9d8ea5df2d6cdd66b6661587c3f50c9268784d91bb8dcd5alSvac+3bf+dZpe/+S2PWiSMcYwhaS1EqFE5535naDgV6EklNyy4ecnL02o1N36Q1M7rAkxr5tSBqEeUUjP9wcbtTGpXjl1a5QnLFPSSBgpU68C6fngxDjRkJXuV6n6BKJz3UPDQqRIlv02esyymloUX6ZqTJOI1pY6Y7WAfQ8NtqISVlAmVXUD4ZxW7Bu3sdnEK6JWI703bYVUo0AQRFBEWp24yRUTi0nXoG/e0rCtyHYz52kgR3zzZLZ0uLXNbBVcAvGLniblWLXYHh0LvRGYcOMkksdD/DBPVcxTvaqM9eqV1Af8IWPTW5AXghC9TCqSyZoTwxcpnxtN+CQEjIouXUuMYmnjfrSov8NsSO+DD8J8RXMVY/86Ty0MM8hLxjz/4t26cAoSIczgz/Cp0hXNB2iqx5NcnDZuo/oJxzAZQ4O/ESdL7RmMh9UAbHlAupbyym3qOa0ZVv+nlk23ic4J6TJbEOBnRZyOgbVL8w6TSpRjNb8UvptID/L8KyqVdWQGZcOVzl7l1gwXh8aba5uAmcvZpSFpbVbP2yKhBGC/4nkLYMWLj0QeQgWCnedDrSTZ2lI48EPz8HDaMt+l6yZqFTy4gh8y31uEf0CIbWXxw="
      },
      {
        name: `mock-name3`,
        address: mockWallet3.cosmosAddress,
        wallet: "cf542edd9c5d9243c4f41a8454f0ffe570865ed8bcbc4e77a04ef140493cdea2NPeQ12rIO2lh/WHi1LEPkJNR4mV/h2CQ1tO1Q0p9//Rwd7wI/p1Jz6GHwYXySUDXKJyB6+nWC9naYRFdAfKwAYQEbLYHSJ54LVxglMgutnk2kvOIWjYeOJVLaUBjkBr+/mL0nem9x/f94Q/hUQqj6MA7e8OF05LK/Udbwh/0YivDlqm1KWR5y8vhjIzOJ44aUnFqnyjtEcl2jDz/uVGNhToxvbAUs7AEvOI8BJjYvFESD6KN9L8/f++xjnPS136/Lx72YNZEg8q7AHMouuQXjr61/tBRQ7eYj8CZ+PVP3hgkEsn4Kae8uSEjf9hG+Jf+lb+JiXwLLr4FNuA2URD/8wctqe6+kZWF2btRTBTQIAgVxRD6JxBHNEforV5p4DFTPTsQlCGnNRPKt/X9Ej39eQj+Ydbg8crOisG7sKvAnL8WslZU+TrTWXx+N1ojs5c2jW083urHmu7VrOAjOMjPG4LRlr5Wmn3IlUOmSd30WLh4uBwGZF62W1pZzJxDKY8iDaKgJTcSv9PO0Z3GaxxZu1+NLar9q2HSciANjy6piTJXGkL0jrvrzo3ult1mnggK3dGtPU8LXhzDHzz3VSz2uBXwCVIn5Gu9s1IZ68Xx/3U="
      }
    ])
  })

  it(`prevents you from adding a wallet with the same name twice`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password', 'regen-testnet')
    expect(() => storeWallet(mockWallet2, 'mock-name', 'mock-password2', 'regen-testnet')).toThrow()

    expect(JSON.parse(localStorage.getItem(`cosmos-wallets-index`) || '[]')).toEqual([
      {
        name: `mock-name`,
        address: mockWallet.cosmosAddress,
        wallet: "913a52f450e97fcfcc602e78a75623173ee0f4014afb8c0c94684f6a5da5773blTsdrWocvgX+zU64RxleCj2pdit4dKpX8Y0dV7pxaGzxmVIK/FIILY7ohRo3YNEKSSMj+uDHuc3pJcBsfjfMvGlzgSdzZ8pt/apPrfHf5ZzdluJGPvL4OL/7vTImo+4OTYda4PT2FwSrDo0RNl+199AnV2EszkGvcq9hgvHlASNQVz/yVvOK2F1miaTvJcpRHITUaS5GuPGNnMOwtLT9H2TDfZQzTiHAMLNp8aFU07N71ANiy+osbmQQUBWWqCzJdrC+sOKjM3YcaRycFMUTQYt0lwNsgWJcEBEo+vSBR2YbsG64QAbJ+hE54m0ioDzkB5XtA+wXCPPKf6ERdjX7iPoCdf9zQ4Yad1rHKlpmPO0+/uxntLiGYh4YvWvI9Dvh6UBi/5I/UUL00ApKQWRJbcCoiwVGKh+pFklEqoMYhXk0HYLnH8hvcekyuhA8GcfOhILue+lx3xcDmdNFhmpKIPaejJhZT4NVBYxj+Y8F+p5THx/IGRNrsA4GeZ0EKDfgMXIe6OhItm1WtpsKZZ6XLKkF+qOPEsMYtBb4Ev9JkBxmT/FwgEaCApgbJedc5wqCf+yW/UTJexvysVV18FXEQ+8Y7NhsiyNvf/kmjF5sWtE="
      }
    ])
  })

  it(`loads a stored wallet`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password', 'regen-testnet')
    const key = getStoredWallet(mockWallet.cosmosAddress, 'mock-password')
    expect(key.privateKey).toBe(mockWallet.privateKey)
  })

  it(`signals if there is no stored wallet for an address`, () => {
    expect(() => getStoredWallet(mockWallet.cosmosAddress, 'mock-password')).toThrow()
  })

  it(`signals if the password for the stored wallet is incorrect`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password', 'regen-testnet')
    expect(() => getStoredWallet(mockWallet.cosmosAddress, 'wrong-password')).toThrow()
  })

  it(`tests if a password is correct for a localy stored key`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password', 'regen-testnet')
    expect(() => testPassword(mockWallet.cosmosAddress, 'mock-password')).not.toThrow()
    expect(() => testPassword(mockWallet.cosmosAddress, 'wrong-password')).toThrow()
  })

  it(`throws if wallet to test password for is not existent for better error output`, () => {
    expect(() => testPassword(mockWallet.cosmosAddress, 'mock-password')).toThrow()
  })

  it(`prevents you from overwriting existing key names`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password', 'regen-testnet')
    expect(() => storeWallet(mockWallet, 'mock-name', 'mock-password', 'regen-testnet')).toThrow()
  })

  it(`prevents you from overwriting existing wallets`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password', 'regen-testnet')
    expect(() => storeWallet(mockWallet, 'mock-name2', 'mock-password', 'regen-testnet')).toThrow()
  })

  it(`removes a wallet`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password', 'regen-testnet')
    storeWallet(mockWallet2, 'mock-name2', 'mock-password', 'regen-testnet')
    removeWallet(mockWallet.cosmosAddress, 'mock-password')
    expect(() => getStoredWallet(mockWallet.cosmosAddress, 'mock-password')).toThrow()
    expect(JSON.parse(localStorage.getItem(`cosmos-wallets-index`) || '[]')).toEqual([
      {
        name: `mock-name2`,
        address: mockWallet2.cosmosAddress,
        wallet: "cc9a14afbac325d9b1c1093ac26187b36cff5a266588d787a9bac156559bd0eaHP8siEPgoX67XlaAvTaT/WURq+gT/NdAgBAnw5vEBcjBlnkIBjlMbCypVoD9DQya0ztexro4blKgZ8uQ5/HtwYz90ELbDxHbRtchJILh7oBocSoYlxv29hQp7p0NkiYRbRLxrVJrsbUNWO7DT5XaJkYWXfmnXHaFs8jEhQ677krSfLD2p387zj/t6gkYGEJYzgmnIae/WW/vs2tHN1HILFKeYbLgKNniUPxyCMniJdAMe4gzDYQd1I3ywNHFLleE2q+Fhr12LnnNF3rnt2HLxv8y1sA2KPffTX3pqCq7GFsx8L0i2ICDFPo/dWzuys4CK0xBKH+O0JJBpvTrnKDAoYnrr9YKcXzJfxm/qIMvli32sHP6ibFkB+KR27FI0EFhAR6RVCQWq98kmY8ky3sZmlXabdJpEZ4TdToqmpn5ddFfq0TfPvJ0h3/KXDOwZ7Umh2uxWJkvTWiWI5Pgl74ZR3u+Zbz4UXh2ce1/gjiahrBWWoSHC3cerJex4pLHdAR7TfWHzcV7c7q1ejaNd6rrgGvPY+yE4mr74t5y8cT7g2YK1YZLOvskKuvw8riSeSzuDENQG1vZpw4TK+wCABFN2gyYZQSpW0j6ear+bCEqK08="
      }
    ])
  })

  it(`throws if the password for a wallet while removing is incorrect`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password', 'regen-testnet')
    expect(() => removeWallet(mockWallet.cosmosAddress, 'wrong-password')).toThrow()
    expect(() => getStoredWallet(mockWallet.cosmosAddress, 'mock-password')).not.toThrow()
  })

  it(`gives an error if the wallet to remove doesn't exist for better error outputs`, () => {
    expect(() => removeWallet(mockWallet.cosmosAddress, 'mock-password')).toThrow()
  })

  it(`store index data and enrich it with network data`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password', 'regen-testnet')
    storeWallet(mockWallet2, 'mock-name2', 'mock-password', 'regen-testnet')
    storeWallet(mockWallet3, 'mock-name3', 'mock-password', 'regen-testnet')
    // get enriched version
    const wallets = getWalletIndex()
    const expectedValue = [
      {
        address: mockWallet.cosmosAddress,
        name: 'mock-name',
        network: 'regen-testnet',
        wallet: "c42d27efbfb9ed952aeadd3a60abc0c35223e502664baf1bc6880dce3e21c771g8eSGFuRTwGeGJ1nfGKi/4/0vd2wLqg94Awu++GHVLn+8yPrTMQEcmhP2UQ9XuCiutzmNRJymocvujeTWBZBoFdfYgWFOSL/w3S0TN2Ls1aPeoa0Ug3AyitV+ex3isv1J4mHKdmUOGLBmv7ee1exK0Ndy6Sh976oghGxHDk/CE4XzBK1CqdUdTynxR5puMAuzWKgt5I+aMMz6VOdEORsM1hEDLEhz7mnsFBecCnwpnGc1apDMHfphaCuYzW0gQJrCBB+9dKR5HEt4mRD8Ex7FZeR3KPlYCmf80wlRhdSPBIJAi7Qbpjfo5RElWMmOpVK+sH2sGnQ931QVfl5VO2/TY4LyqRmtRhnqccrXjX9o5hqr5sESYgtA9q/ztr/nTyy3p7Tyz7HUB1gFwMkqXp2PQT90d/jdetSmN9Z3mHyy8FBBQqv5viE+CGS1WqqMt0Yj3eKQSZH3wcPOv5OQGjjaonL7VbfKgXYfR5Wdn0cABE5t42Evsdiw2J+57d6qi98NTGJFH+O/t2qoKvYE/rvdeCDmYiSpveW+9iMxVp806gebC76lNMSUFMLXwPeoeqN9B5p4A+wIZfhd0OHpICGS0WXJgRvAdzChnn6/DhMYwQ="
      },
      {
        address: mockWallet2.cosmosAddress,
        name: 'mock-name2',
        network: 'regen-testnet',
        wallet: "c42d27efbfb9ed952aeadd3a60abc0c35223e502664baf1bc6880dce3e21c771g8eSGFuRTwGeGJ1nfGKi/4/0vd2wLqg94Awu++GHVLn+8yPrTMQEcmhP2UQ9XuCiutzmNRJymocvujeTWBZBoFdfYgWFOSL/w3S0TN2Ls1aPeoa0Ug3AyitV+ex3isv1J4mHKdmUOGLBmv7ee1exK0Ndy6Sh976oghGxHDk/CE4XzBK1CqdUdTynxR5puMAuzWKgt5I+aMMz6VOdEORsM1hEDLEhz7mnsFBecCnwpnGc1apDMHfphaCuYzW0gQJrCBB+9dKR5HEt4mRD8Ex7FZeR3KPlYCmf80wlRhdSPBIJAi7Qbpjfo5RElWMmOpVK+sH2sGnQ931QVfl5VO2/TY4LyqRmtRhnqccrXjX9o5hqr5sESYgtA9q/ztr/nTyy3p7Tyz7HUB1gFwMkqXp2PQT90d/jdetSmN9Z3mHyy8FBBQqv5viE+CGS1WqqMt0Yj3eKQSZH3wcPOv5OQGjjaonL7VbfKgXYfR5Wdn0cABE5t42Evsdiw2J+57d6qi98NTGJFH+O/t2qoKvYE/rvdeCDmYiSpveW+9iMxVp806gebC76lNMSUFMLXwPeoeqN9B5p4A+wIZfhd0OHpICGS0WXJgRvAdzChnn6/DhMYwQ="
      },
      {
        address: mockWallet3.cosmosAddress,
        name: 'mock-name3',
        network: 'regen-testnet',
        wallet: "c42d27efbfb9ed952aeadd3a60abc0c35223e502664baf1bc6880dce3e21c771g8eSGFuRTwGeGJ1nfGKi/4/0vd2wLqg94Awu++GHVLn+8yPrTMQEcmhP2UQ9XuCiutzmNRJymocvujeTWBZBoFdfYgWFOSL/w3S0TN2Ls1aPeoa0Ug3AyitV+ex3isv1J4mHKdmUOGLBmv7ee1exK0Ndy6Sh976oghGxHDk/CE4XzBK1CqdUdTynxR5puMAuzWKgt5I+aMMz6VOdEORsM1hEDLEhz7mnsFBecCnwpnGc1apDMHfphaCuYzW0gQJrCBB+9dKR5HEt4mRD8Ex7FZeR3KPlYCmf80wlRhdSPBIJAi7Qbpjfo5RElWMmOpVK+sH2sGnQ931QVfl5VO2/TY4LyqRmtRhnqccrXjX9o5hqr5sESYgtA9q/ztr/nTyy3p7Tyz7HUB1gFwMkqXp2PQT90d/jdetSmN9Z3mHyy8FBBQqv5viE+CGS1WqqMt0Yj3eKQSZH3wcPOv5OQGjjaonL7VbfKgXYfR5Wdn0cABE5t42Evsdiw2J+57d6qi98NTGJFH+O/t2qoKvYE/rvdeCDmYiSpveW+9iMxVp806gebC76lNMSUFMLXwPeoeqN9B5p4A+wIZfhd0OHpICGS0WXJgRvAdzChnn6/DhMYwQ="
      }
    ]
    expect(wallets).toEqual(expect.arrayContaining(expectedValue))
  })
})
