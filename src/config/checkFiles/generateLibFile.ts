import fs from 'node:fs'
import path from 'node:path'
import consola from 'consola'
import { checkProviderDependencies, type AdapterInfo } from './checkProviderDependencies'

interface GenerateLibFileOptions {
  rootDir: string
  finalPath: string
  outputPath: string | null
  provider: string | null
}

/**
 * Crea el directorio si no existe
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    consola.info(`Directorio creado: ${dirPath}`)
  }
}

/**
 * Resuelve la ruta de importación de Prisma Client
 */
function resolvePrismaImportPath(finalDir: string, outputPath: string | null): string {
  if (!outputPath) {
    return '@prisma/client'
  }

  const relativePath = path.relative(finalDir, outputPath)
  const normalizedPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`

  return normalizedPath.replace(/\\/g, '/')
}

/**
 * Obtiene la información del adaptador si el provider está definido
 */
function getAdapterInfo(provider: string | null, rootDir: string): AdapterInfo | null {
  if (!provider) {
    return null
  }

  try {
    return checkProviderDependencies(provider, rootDir)
  }
  catch (error) {
    consola.warn('No se pudo generar la configuración del adaptador:', error instanceof Error ? error.message : String(error))
    return null
  }
}

/**
 * Genera el contenido del archivo lib de Prisma
 */
function generatePrismaLibTemplate(prismaImportPath: string, adapterInfo: AdapterInfo | null): string {
  const adapterConfig = adapterInfo ? adapterInfo.config : ''
  const hasAdapter = !!adapterInfo

  return `import { PrismaClient, Prisma } from '${prismaImportPath}'
${adapterConfig}
declare global {
  var __prisma: PrismaClient | undefined
}

function getInstance(): PrismaClient {
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient({${hasAdapter ? '\n      adapter,' : ''}
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }
  return globalThis.__prisma
}

/**
 * Desconecta explícitamente la instancia de Prisma
 */
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

const prisma = getInstance()

export { prisma, Prisma }
`
}
/**
 * Escribe el contenido del archivo en el sistema de archivos
 */
function writeLibFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf8')
  consola.success(`Archivo generado exitosamente en: ${filePath}`)
}

/**
 * Genera el archivo lib de Prisma Client con singleton pattern
 * @param options - Opciones de configuración para generar el archivo
 * @throws Error si no se puede generar el archivo
 */
export function generateLibFile(options: GenerateLibFileOptions): void {
  const { rootDir, finalPath, outputPath, provider } = options

  try {
    const finalDir = path.dirname(finalPath)

    ensureDirectoryExists(finalDir)

    const prismaImportPath = resolvePrismaImportPath(finalDir, outputPath)
    const adapterInfo = getAdapterInfo(provider, rootDir)
    const templateContent = generatePrismaLibTemplate(prismaImportPath, adapterInfo)

    writeLibFile(finalPath, templateContent)
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    consola.error('Error al generar el archivo:', errorMessage)
    throw new Error(`No se pudo generar el archivo lib de Prisma: ${errorMessage}`)
  }
}

/**
 * Sobrecarga para mantener compatibilidad con la firma anterior
 */
export function generateLibFileCompat(
  rootDir: string,
  finalPath: string,
  outputPath: string | null,
  provider: string | null,
): void {
  generateLibFile({ rootDir, finalPath, outputPath, provider })
}
