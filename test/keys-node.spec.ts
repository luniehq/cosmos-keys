/**
 * @jest-environment node
 */

import { randomBytes } from '../src/cosmos-keys'

describe(`Key Generation in NodeJS`, () => {
  it(`randomBytes polyfilled`, () => {
    expect(randomBytes(32).length).toBe(32)
  })
})
