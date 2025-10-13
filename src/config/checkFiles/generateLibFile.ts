import * as fs from 'node:fs'
import { consola } from 'consola'
import * as path from 'node:path'

export function generateLibFile(finalPath: string): void {
  try {
    const finalDir = path.dirname(finalPath)
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true })
      consola.info(`Created directory: ${finalDir}`)
    }

    const templateContent = `import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

function getInstance(): PrismaClient {
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient()
  }
  return globalThis.__prisma
}

// Función para desconectar explícitamente
export async function disconnectPrisma(): Promise<void> {
  if (globalThis.__prisma) {
    await globalThis.__prisma.$disconnect()
    globalThis.__prisma = undefined
  }
}

// Manejo de cierre del proceso
process.on('beforeExit', async () => {
  await disconnectPrisma()
})

export const prisma = getInstance()
`

    fs.writeFileSync(finalPath, templateContent, 'utf8')
    consola.success('Archivo generado exitosamente')
  }
  catch (error) {
    consola.error('Error al generar el archivo:', error instanceof Error ? error.message : String(error))
  }
}
