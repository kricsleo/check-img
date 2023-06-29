import { describe, expect, it } from 'vitest'
import { Options } from '../src/types'

const options: Options = {
  include: ['./fixtures/**/*.(js|ts)'],
  search: [/https:\/\/\webstatic.*\/upload.*(?=('|"))/],
  minCompressRatio: 0.2
}

describe('should', () => {
  it('exported', () => {
    expect(1).toEqual(1)
  })
})
