import { Result, Options as SearchOptions } from 'file-text-search/types'
import { search } from 'file-text-search'
import tinyfy from 'tinify'

const fileSeachOptions: SearchOptions = {
  include: [],
  search: [/https:\/\/.*(?=('|"))/]
}

async function run(options: Options) {
  const matches = await search(fileSeachOptions)
  const urls = Array.from(new Set(matches.map(t => t.matches.map(k => k.match)).flat()))
  tinyfy.key = options.tinypngKey
  await Promise.all(urls.map(async url => {
    const source = tinyfy.fromUrl(url)
    const [ buffer, compressedSize, rawSize ] = await Promise.all([
      await source.toBuffer(),
      source.result().size(),
      fetchImgMeta(url).then(meta => meta.fileSize)
    ])
    const shouldReplace = (compressedSize / rawSize ) > options.minCompressRatio
    if(shouldReplace) {
      const compressedUrl = await uploadImg(buffer)
      await writeBack(compressedUrl, {} as any)
    }
  }))
}

async function fetchImgMeta(url: string) {
  // https://help.aliyun.com/document_detail/44975.html?spm=a2c4g.44688.0.0.61a54b9bBlH4JX
  const metaUrl = url + '?x-oss-process=image/info'
  const aliyunMeta: AliyunImgMeta = await (await fetch(metaUrl)).json()
  const meta = { fileSize: Number(aliyunMeta.FileSize.value) }
  return meta
}

async function uploadImg(buffer: Uint8Array) {
  // todo: upload img
  return ''
}

async function writeBack(newUrl: string, result: Result) {
  // todo: write back
}

interface Options extends SearchOptions {
  tinypngKey: string
  minCompressRatio: number
}

// https://image-demo.oss-cn-hangzhou.aliyuncs.com/example.jpg?x-oss-process=image/info
interface AliyunImgMeta {
  FileSize: { value: string }
}