import { defineNuxtModule, createResolver, addServerImportsDir } from '@nuxt/kit'
import { checkLibFile, configPrismaForNuxt } from './config'

export default defineNuxtModule({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const rootDir = nuxt.options.rootDir
    const prismaFileDir = resolve(rootDir, 'lib/prisma.ts')
    checkLibFile(prismaFileDir)

    addServerImportsDir(prismaFileDir)

    configPrismaForNuxt(nuxt)
  },
})
