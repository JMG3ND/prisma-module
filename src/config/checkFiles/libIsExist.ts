import * as fs from 'node:fs'
import { consola } from 'consola'

export function libIsExist(path: string) {
  const result = fs.existsSync(path)
  if (!result)
    consola.info('El archivo prisma no se ha generado:', path)
  return result
}
