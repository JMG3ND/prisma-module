import { libIsExist } from './libIsExist'
import { generateLibFile } from './generateLibFile'

export function checkLibFile(rootDir: string, nuxtPath: string, outputPath: string | null, provider: string | null): void {
  if (!libIsExist(nuxtPath)) generateLibFile({
    rootDir,
    finalPath: nuxtPath,
    outputPath,
    provider,
  })
}
