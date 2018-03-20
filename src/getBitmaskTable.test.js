/* eslint-disable no-bitwise */

import { getBitmaskTable } from '.'

test('basic', () => {
  expect(getBitmaskTable(['A', 'b', 'c'])).toEqual({ A: 0b01, b: 0b10, c: 0b100 })
})
