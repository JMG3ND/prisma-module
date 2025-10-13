import { defineNuxtModule, addServerImportsDir, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    addServerImportsDir(resolve('./runtime/prisma/utils'))

    // Configuración automática de Nitro para Prisma
    nuxt.options.nitro = nuxt.options.nitro || {}
    nuxt.options.nitro.experimental = nuxt.options.nitro.experimental || {}
    nuxt.options.nitro.experimental.wasm = true

    nuxt.options.nitro.esbuild = nuxt.options.nitro.esbuild || {}
    nuxt.options.nitro.esbuild.options = nuxt.options.nitro.esbuild.options || {}
    nuxt.options.nitro.esbuild.options.target = 'esnext'

    nuxt.options.nitro.rollupConfig = nuxt.options.nitro.rollupConfig || {}
    nuxt.options.nitro.rollupConfig.external = nuxt.options.nitro.rollupConfig.external || []

    // Asegurar que external sea un array
    if (Array.isArray(nuxt.options.nitro.rollupConfig.external)) {
      nuxt.options.nitro.rollupConfig.external.push('.prisma/client', '@prisma/client')
    }
    else {
      nuxt.options.nitro.rollupConfig.external = ['.prisma/client', '@prisma/client']
    }

    nuxt.options.nitro.rollupConfig.output = nuxt.options.nitro.rollupConfig.output || {}
    nuxt.options.nitro.rollupConfig.output.manualChunks = (id) => {
      if (id.includes('@prisma/client') || id.includes('.prisma')) {
        return 'prisma'
      }
    }

    nuxt.options.nitro.moduleSideEffects = nuxt.options.nitro.moduleSideEffects || []
    nuxt.options.nitro.moduleSideEffects.push('@prisma/client')

    // Configuración automática de Vite para Prisma
    nuxt.options.vite = nuxt.options.vite || {}

    nuxt.options.vite.define = nuxt.options.vite.define || {}
    nuxt.options.vite.define.global = 'globalThis'

    nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}
    nuxt.options.vite.optimizeDeps.include = nuxt.options.vite.optimizeDeps.include || []
    nuxt.options.vite.optimizeDeps.include.push('@prisma/client')

    nuxt.options.vite.optimizeDeps.exclude = nuxt.options.vite.optimizeDeps.exclude || []
    nuxt.options.vite.optimizeDeps.exclude.push('.prisma/client')

    nuxt.options.vite.ssr = nuxt.options.vite.ssr || {}
    nuxt.options.vite.ssr.noExternal = nuxt.options.vite.ssr.noExternal || []
    if (Array.isArray(nuxt.options.vite.ssr.noExternal)) {
      nuxt.options.vite.ssr.noExternal.push('@prisma/client')
    }

    nuxt.options.vite.ssr.external = nuxt.options.vite.ssr.external || []
    if (Array.isArray(nuxt.options.vite.ssr.external)) {
      nuxt.options.vite.ssr.external.push('.prisma/client')
    }

    nuxt.options.vite.resolve = nuxt.options.vite.resolve || {}
    nuxt.options.vite.resolve.alias = nuxt.options.vite.resolve.alias || {}
    ;(nuxt.options.vite.resolve.alias as Record<string, string>)['.prisma/client/index-browser'] = '.prisma/client/index.js'
  },
})
