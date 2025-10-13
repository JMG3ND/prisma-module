import * as fs from 'node:fs'
import { consola } from 'consola'
import * as path from 'node:path'

export function generateLibFile(finalPath: string): void {
  try {
    const filePath = path.resolve('./src/config/checkFiles/prisma.ts')

    // Check if source file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Source file not found: ${filePath}`)
    }

    const finalDir = path.dirname(finalPath)
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true })
      consola.info(`Created directory: ${finalDir}`)
    }

    fs.copyFileSync(filePath, finalPath)
    consola.success('Archivo generado exitosamente')
  }
  catch (error) {
    consola.error('Error al copiar el archivo:', error instanceof Error ? error.message : String(error))
  }
}
