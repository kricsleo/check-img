import { describe, expect, it } from 'vitest'
import { Options } from '../src/types'
import { checkImg } from '../src'
import { search } from 'file-text-search'
import { compress } from '../src/adapter/tinypng'
import { upload } from '../src/adapter/upload'
import { fetchImgSize } from '../src/adapter/aliyun'

const options: Options = {
  include: ['./test/fixtures/**/*.(js|ts)'],
  search: [/https?:\/\/.*\.png(?=('|"))/],
  minCompressRatio: 0,
  compress: compress,
  upload: upload,
  fetchImgSize: fetchImgSize
}

describe('check img', () => {
  it('replace compressed img', async () => {
    const beforeCompressedMatches = await search(options)
    expect(beforeCompressedMatches.length).gt(0)
    await checkImg(options)
    const afterCompressedMatches = await search(options)
    expect(afterCompressedMatches.length).toEqual(0)
  })
})
