import { Options } from '../types'

export const upload: Options['upload'] = buffer => {
  return 'https://mock.example.com/hi.png'
}