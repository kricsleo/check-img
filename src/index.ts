import { Options as SearchOptions } from 'file-text-search/types'
import { search } from 'file-text-search'
import tinyfy from 'tinify'

const fileSeachOptions: SearchOptions = {
  include: [],
  search: [/https:\/\/.*(?=('|"))/]
}

interface Options extends SearchOptions {
  tinypngKey: string
}

async function run(options: Options) {
  const matches = await search(fileSeachOptions)
  const urls = Array.from(new Set(matches.map(t => t.matches.map(k => k.match)).flat()))
  tinyfy.key = options.tinypngKey
  await Promise.all(urls.map(async url => {
    const source = tinyfy.fromUrl(url)
    // todo: generate img name to write img
    await source.toFile(Math.random() + '.png')
    // todo: check compress size
    // todo: upload img after tinyfied
  }))
}