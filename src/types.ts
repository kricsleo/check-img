import { Match, Options as SearchOptions } from 'file-text-search/types'

export interface Options extends SearchOptions {
  minCompressRatio: number
  fetchImgSize: (url: string) => MaybePromsie<number>
  compress: (url: string) => MaybePromsie<{ buffer: Uint8Array; size: number }>
  upload: (buffer: Uint8Array) => MaybePromsie<string>
}

export interface CompressedMatch extends Match {
  optimized: string
}

export type MaybePromsie<T> = T | Promise<T>