import { defineNuxtModule, createResolver, addServerImportsDir } from '@nuxt/kit'
import { checkLibFile, configPrismaForNuxt } from './config'

interface MyModuleOptions {
  routePrismaDir: string
}

export default defineNuxtModule<MyModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
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

    checkLibFile(prismaFileDir)

    addServerImportsDir(prismaFileDir)

    configPrismaForNuxt(nuxt)
  },
})
