import { libIsExist } from './libIsExist'
import { generateLibFile } from './generateLibFile'

export function checkLibFile(nuxtPath: string) {
  if (!libIsExist(nuxtPath)) generateLibFile(nuxtPath)
}
