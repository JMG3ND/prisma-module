import fs from 'node:fs'
import path from 'node:path'
import consola from 'consola'

// Mapeo de providers a sus adaptadores correspondientes
const PROVIDER_ADAPTERS: Record<string, {
  module: string
  adapter: string
  config: string
}> = {
  // PostgreSQL (driver `pg`)
  postgresql: {
    module: '@prisma/adapter-pg',
    adapter: 'PrismaPg',
    config: `import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = \`\${process.env.DATABASE_URL}\`
const adapter = new PrismaPg({ connectionString })
`,
  },
  // MySQL / MariaDB (driver `mariadb`)
  mariadb: {
    module: '@prisma/adapter-mariadb',
    adapter: 'PrismaMariaDb',
    config: `import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
})
`,
  },
  mysql: {
    module: '@prisma/adapter-mariadb',
    adapter: 'PrismaMariaDb',
    config: `import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
})
`,
  },

  // SQLite (better-sqlite3)
  sqlite: {
    module: '@prisma/adapter-better-sqlite3',
    adapter: 'PrismaBetterSqlite3',
    config: `import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
})
`,
  },

  // SQL Server (node-mssql)
  sqlserver: {
    module: '@prisma/adapter-mssql',
    adapter: 'PrismaMssql',
    config: `import 'dotenv/config'
import { PrismaMssql } from '@prisma/adapter-mssql'
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.HOST,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,             // para Azure
    trustServerCertificate: false, // true para local / self‑signed certs
  },
}
const adapter = new PrismaMssql(sqlConfig)
`,
  },

  // Neon / Vercel Postgres (serverless Postgres)
  neon: {
    module: '@prisma/adapter-neon',
    adapter: 'PrismaNeon',
    config: `import 'dotenv/config'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon(process.env.DATABASE_URL)
`,
  },

  // PlanetScale (MySQL serverless)
  planetscale: {
    module: '@prisma/adapter-planetscale',
    adapter: 'PrismaPlanetScale',
    config: `import 'dotenv/config'
import { PrismaPlanetScale } from '@prisma/adapter-planetscale'
import { fetch as undiciFetch } from 'undici'

const adapter = new PrismaPlanetScale({
  url: process.env.DATABASE_URL,
  fetch: undiciFetch,
})
`,
  },

  // LibSQL / Turso (SQLite-ish over HTTP)
  libsql: {
    module: '@prisma/adapter-libsql',
    adapter: 'PrismaLibSQL',
    config: `import 'dotenv/config'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? '',
})`,
  },
}

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

/**
 * Lee el archivo package.json
 */
function readPackageJson(packagePath: string): PackageJson | null {
  try {
    const content = fs.readFileSync(packagePath, 'utf-8')
    return JSON.parse(content)
  }
  catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      consola.error('No se encontró el archivo package.json en:', packagePath)
    }
    else {
      consola.error('Error al leer package.json:', error)
    }
    return null
  }
}

/**
 * Verifica si una dependencia está instalada en el package.json
 */
function isDependencyInstalled(packageJson: PackageJson, dependencyName: string): boolean {
  const { dependencies = {}, devDependencies = {} } = packageJson
  return dependencyName in dependencies || dependencyName in devDependencies
}

/**
 * Obtiene la información del adaptador requerido para un provider
 */
function getRequiredAdapter(provider: string): { module: string, adapter: string, config: string } {
  const normalizedProvider = provider.toLowerCase()
  const adapterInfo = PROVIDER_ADAPTERS[normalizedProvider]

  if (!adapterInfo) {
    throw new Error(`El provider "${provider}" no tiene un adaptador compatible con Prisma`)
  }

  return adapterInfo
}

export interface AdapterInfo {
  importStatement: string
  adapterName: string
  config: string
}

/**
 * Verifica si el adaptador de Prisma necesario para el provider está instalado
 * @param provider - El provider del datasource de Prisma (postgresql, mysql, sqlite, etc.)
 * @param projectRoot - Ruta raíz del proyecto donde está el package.json
 * @returns Información del adaptador (import statement, nombre y configuración)
 * @throws Error si el adaptador no está instalado o el provider no es válido
 */
export function checkProviderDependencies(provider: string | null, projectRoot: string): AdapterInfo | null {
  if (!provider) {
    return null
  }

  const { module, adapter, config } = getRequiredAdapter(provider)

  const packageJsonPath = path.join(projectRoot, 'package.json')
  const packageJson = readPackageJson(packageJsonPath)

  if (!packageJson) {
    throw new Error('No se pudo leer package.json para verificar dependencias')
  }

  const isInstalled = isDependencyInstalled(packageJson, module)

  if (!isInstalled) {
    consola.error(`✗ Falta el adaptador ${module} para el provider "${provider}"`)
    consola.info(`  Instálalo con: npm install ${module}`)
    throw new Error(`El adaptador ${module} no está instalado. Ejecuta: npm install ${module}`)
  }

  consola.success(`✓ Adaptador ${module} encontrado para provider "${provider}"`)

  return {
    importStatement: `import { ${adapter} } from '${module}'`,
    adapterName: adapter,
    config,
  }
}
