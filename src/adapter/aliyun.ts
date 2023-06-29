import { Options } from '../types'
import fetch from 'node-fetch'

// https://image-demo.oss-cn-hangzhou.aliyuncs.com/example.jpg?x-oss-process=image/info
// https://help.aliyun.com/document_detail/44975.html?spm=a2c4g.44688.0.0.61a54b9bBlH4JX
interface AliyunImgMeta {
  FileSize: { value: string }
}

export const fetchImgSize: Options['fetchImgSize'] = async (url: string) => {
  const metaUrl = url + '?x-oss-process=image/info'
  const aliyunMeta = await (await fetch(metaUrl)).json() as AliyunImgMeta
  return Number(aliyunMeta.FileSize.value)
}

