import { defineNuxtModule, createResolver, addServerImportsDir } from '@nuxt/kit'
import { checkLibFile, configPrismaForNuxt, readSchemaPrisma, checkPrismaConfigFile } from './config'

interface MyModuleOptions {
  routePrismaDir: string
}

export default defineNuxtModule<MyModuleOptions>({
  meta: {
    name: 'prisma-module',
    configKey: 'prismaModule',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    /* default options */
    routePrismaDir: 'lib/prisma.ts',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const rootDir = nuxt.options.rootDir
    const prismaFileDir = resolve(rootDir, options.routePrismaDir)
    const prismaSchemaPath = resolve(rootDir, 'prisma/schema.prisma')
    const prismaConfigTsPath = resolve(rootDir, 'prisma.config.ts')

    checkPrismaConfigFile(prismaConfigTsPath)

    // Leer el archivo schema.prisma
    const { outputPath, provider } = readSchemaPrisma(prismaSchemaPath)

    checkLibFile(rootDir, prismaFileDir, outputPath, provider)

    addServerImportsDir(prismaFileDir)

    configPrismaForNuxt(nuxt)
  },
})
