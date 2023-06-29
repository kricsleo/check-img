import { Match, Options as SearchOptions } from 'file-text-search/types'
import { search } from 'file-text-search'
import tinyfy from 'tinify'
import fs from 'fs/promises'
import fetch from 'node-fetch'

const options: Options = {
  include: ['**/*.(js|ts|vue)'],
  search: [/https:\/\/\webstatic.*\/upload.*(?=('|"))/],
  tinypngKey: '',
  minCompressRatio: 0.2
}

// run(options)

async function run(options: Options) {
  const matches = await search(options)
  tinyfy.key = options.tinypngKey
  const optimizedCache: Record<string, string> = {}
  const writeCache: Record<string, OptimizedMatch[]> = {}
  await Promise.all(matches.map(async match => {
    if(optimizedCache[match.match]) {
      writeCache[match.file] ||= []
      writeCache[match.file].push({ ...match, optimized: optimizedCache[match.match] })
    } else {
      // const source = tinyfy.fromUrl(match.match)
      // const [ buffer, compressedSize, rawSize ] = await Promise.all([
      //   await source.toBuffer(),
      //   source.result().size(),
      //   fetchImgMeta(match.match).then(meta => meta.fileSize)
      // ])

      // const rawSize = await fetchImgMeta(match.match).then(meta => meta.fileSize)
      const rawSize = 1000 
      const compressedSize = rawSize * 0.7
      const buffer = new Uint8Array()

      const shouldOptimize = (compressedSize / rawSize ) > options.minCompressRatio
      if(shouldOptimize) {
        const optimized = await uploadImg(buffer)
        optimizedCache[match.match] = optimized
        writeCache[match.file] ||= []
        writeCache[match.file].push({ ...match, optimized: optimizedCache[match.match] })
      }
    }
  }))
  await Promise.all(Object.entries(writeCache).map(async ([file, matches]) => {
    const content = await fs.readFile(file, 'utf-8')
    const optimizedContent = optimizeContent(content, matches)
    // todo: check diff before write
    await fs.writeFile(file, optimizedContent)
  }))
}

async function fetchImgMeta(url: string) {
  // https://help.aliyun.com/document_detail/44975.html?spm=a2c4g.44688.0.0.61a54b9bBlH4JX
  const metaUrl = url + '?x-oss-process=image/info'
  const aliyunMeta = await (await fetch(metaUrl)).json() as AliyunImgMeta
  const meta = { fileSize: Number(aliyunMeta.FileSize.value) }
  return meta
}

async function uploadImg(buffer: Uint8Array) {
  // todo: upload img
  return 'https://kricsleo.img'
}

function optimizeContent(content: string, matches: OptimizedMatch[]) {
  const sortedMatches = matches.sort((a, b) => a.start - b.start).flat()
  const newContent = sortedMatches.reduce((acc, cur, idx, arr) => {
    if(idx === 0) {
      acc += content.slice(0, cur.start) + cur.optimized
    } else {
      acc += content.slice(arr[idx - 1].end, cur.start) + cur.optimized
    }
    return acc
  }, '') + content.slice(sortedMatches[sortedMatches.length - 1].end)
  return newContent
}

interface Options extends SearchOptions {
  tinypngKey: string
  minCompressRatio: number
}

// https://image-demo.oss-cn-hangzhou.aliyuncs.com/example.jpg?x-oss-process=image/info
interface AliyunImgMeta {
  FileSize: { value: string }
}

interface OptimizedMatch extends Match {
  optimized: string
}