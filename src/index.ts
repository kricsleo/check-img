import { Options as SearchOptions } from 'file-text-search/types'
import { search } from 'file-text-search'
import tinyfy from 'tinify'

const fileSeachOptions: SearchOptions = {
  include: [],
  search: [/https:\/\/.*(?=('|"))/]
}

interface Options extends SearchOptions {
  tinypngKey: string
  minCompressRatio: number
}

async function run(options: Options) {
  const matches = await search(fileSeachOptions)
  const urls = Array.from(new Set(matches.map(t => t.matches.map(k => k.match)).flat()))
  tinyfy.key = options.tinypngKey
  await Promise.all(urls.map(async url => {
    const source = tinyfy.fromUrl(url)
    const buffer = await source.toBuffer()
    // todo: check compress size
    const result = source.result()
    console.log('result', result)
    const compressSize = 0.2
    const shouldReplace = compressSize > options.minCompressRatio
    if(shouldReplace) {
      await uploadImg(buffer)
    }
  }))
}

async function uploadImg(buffer: Uint8Array) {
  // todo: upload img
}