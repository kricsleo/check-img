import { search } from 'file-text-search'
import fs from 'fs/promises'
import { CompressedMatch, Options } from './types'

export async function checkImg(options: Options) {
  const matches = await search(options)
  const optimizedCache: Record<string, string> = {}
  const writeCache: Record<string, CompressedMatch[]> = {}
  await Promise.all(matches.map(async match => {
    if(optimizedCache[match.match]) {
      writeCache[match.file] ||= []
      writeCache[match.file].push({ ...match, optimized: optimizedCache[match.match] })
    } else {
      const [ compressed, rawSize ] = await Promise.all([
        await options.compress(match.match),
        await options.fetchImgSize(match.match),
      ])

      const shouldOptimize = (compressed.size / rawSize ) > options.minCompressRatio
      if(shouldOptimize) {
        const optimized = await options.upload(compressed.buffer)
        optimizedCache[match.match] = optimized
        writeCache[match.file] ||= []
        writeCache[match.file].push({ ...match, optimized: optimizedCache[match.match] })
      }
    }
  }))
  await Promise.all(Object.entries(writeCache).map(async ([file, matches]) => {
    const content = await fs.readFile(file, 'utf-8')
    const newContent = replaceContent(content, matches)
    await fs.writeFile(file, newContent)
  }))
}

function replaceContent(content: string, matches: CompressedMatch[]) {
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
