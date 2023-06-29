import { Match, Options as SearchOptions } from 'file-text-search/types'
import { search } from 'file-text-search'
import tinyfy from 'tinify'
import fs from 'fs/promises'

const fileSeachOptions: SearchOptions = {
  include: [],
  search: [/https:\/\/.*(?=('|"))/]
}

async function run(options: Options) {
  const matches = await search(fileSeachOptions)
  tinyfy.key = options.tinypngKey
  const optimizedCache: Record<string, string> = {}
  const writeCache: Record<string, OptimizedMatch[]> = {}
  await Promise.all(matches.map(async match => {
    if(optimizedCache[match.match]) {
      writeCache[match.file] ||= []
      writeCache[match.file].push({ ...match, optimized: optimizedCache[match.match] })
    } else {
      const source = tinyfy.fromUrl(match.match)
      const [ buffer, compressedSize, rawSize ] = await Promise.all([
        await source.toBuffer(),
        source.result().size(),
        fetchImgMeta(match.match).then(meta => meta.fileSize)
      ])
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
    // await fs.writeFile(file, optimizedContent)
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

function optimizeContent(content: string, matches: OptimizedMatch[]) {
  const sortedMatches = matches.sort((a, b) => a.start - b.start).flat()
  const newContent = sortedMatches.reduce((acc, cur, idx, arr) => {
    if(idx === 0) {
      acc += content.slice(0, cur.start) + cur.optimized
    } else if(idx === arr.length - 1) {
      acc += content.slice(cur.end + 1, content.length - 1) + + cur.optimized
    } else {
      acc += cur.optimized + content.slice(arr[idx - 1].end + 1, cur.start)
    }
    return acc
  }, '')
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