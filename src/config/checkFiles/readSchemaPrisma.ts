import fs from 'node:fs'
import path from 'node:path'
import consola from 'consola'

// Expresiones regulares para extraer output y provider
const OUTPUT_REGEX = /generator\s+client\s*\{[^}]*output\s*=\s*"([^"]+)"/
const PROVIDER_REGEX = /datasource\s+\w+\s*\{[^}]*provider\s*=\s*"([^"]+)"/

interface SchemaInfo {
  outputPath: string | null
  provider: string | null
}

interface SchemaExtraction {
  outputPath?: string
  provider?: string
}

/**
 * Lee el contenido del archivo schema.prisma
 */
function readSchemaFile(schemaPath: string): string | null {
  try {
    return fs.readFileSync(schemaPath, 'utf-8')
  }
  catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      consola.info('Por favor, instala Prisma e inicializa el esquema con: npx prisma init')
    }
    else {
      consola.error('Error al leer el archivo schema.prisma:', error)
    }
    return null
  }
}

/**
 * Extrae información del schema usando expresiones regulares
 */
function extractSchemaInfo(schemaContent: string): SchemaExtraction {
  const outputMatch = schemaContent.match(OUTPUT_REGEX)
  const providerMatch = schemaContent.match(PROVIDER_REGEX)

  return {
    outputPath: outputMatch?.[1],
    provider: providerMatch?.[1],
  }
}

/**
 * Valida y muestra advertencias sobre la información extraída
 */
function validateSchemaInfo(extraction: SchemaExtraction): void {
  if (!extraction.outputPath) {
    consola.warn('No se encontró la propiedad "output" en el generator client del schema.prisma')
  }

  if (!extraction.provider) {
    consola.warn('No se encontró la propiedad "provider" en el datasource del schema.prisma')
  }
}

/**
 * Convierte el outputPath relativo a una ruta absoluta
 */
function resolveOutputPath(schemaPath: string, outputPath: string | undefined): string | null {
  if (!outputPath) {
    return null
  }

  const schemaDir = path.dirname(schemaPath)
  return path.resolve(schemaDir, outputPath)
}

/**
 * Muestra información del schema en consola
 */
function logSchemaInfo(outputPath: string | null, provider: string | null): void {
  consola.info('Output path encontrado en schema.prisma:', outputPath)
  if (provider) {
    consola.info('Provider encontrado en schema.prisma:', provider)
  }
}

/**
 * Lee y extrae información del archivo schema.prisma de Prisma
 * @param schemaPath - Ruta al archivo schema.prisma
 * @returns Objeto con outputPath y provider, o null si hay error
 */
export function readSchemaPrisma(schemaPath: string): SchemaInfo {
  const schemaContent = readSchemaFile(schemaPath)

  if (!schemaContent) {
    return {
      outputPath: null,
      provider: null,
    }
  }

  const extraction = extractSchemaInfo(schemaContent)
  validateSchemaInfo(extraction)

  const absoluteOutputPath = resolveOutputPath(schemaPath, extraction.outputPath)
  const provider = extraction.provider || null

  logSchemaInfo(absoluteOutputPath, provider)

  return {
    outputPath: absoluteOutputPath,
    provider,
  }
}
