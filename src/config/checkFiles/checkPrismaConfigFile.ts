import fs from 'node:fs'
import consola from 'consola'

export function checkPrismaConfigFile(prismaConfigPath: string) {
  try {
    fs.readFileSync(prismaConfigPath, 'utf-8')
  }
  catch (error) {
    // lógica para escribir el archivo si no existe
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      const defaultConfig = `import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // opcional: seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
`
      fs.writeFileSync(prismaConfigPath, defaultConfig, 'utf-8')
      consola.success('Archivo prisma.config.ts creado exitosamente')
    }
    else {
      consola.error('Error al leer el archivo prisma.config.ts:', error)
    }
  }
}
