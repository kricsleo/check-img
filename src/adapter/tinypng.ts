import tinyfy from 'tinify'
import { Options } from '../types'
import { TINYPNG_KEY } from '../.local'

export const compress: Options['compress'] = async url => {
  tinyfy.key = TINYPNG_KEY
  const source = tinyfy.fromUrl(url)
  const [buffer, size] = await Promise.all([
    source.toBuffer(),
    source.result().size(),
  ])
  return { buffer, size }
}