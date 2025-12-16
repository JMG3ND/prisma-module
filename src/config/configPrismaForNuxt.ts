import type { Nuxt } from 'nuxt/schema'

export function configPrismaForNuxt(nuxt: Nuxt) {
  // Configuración automática de Nitro para Prisma 7
  nuxt.options.nitro = nuxt.options.nitro || {}
  nuxt.options.nitro.experimental = nuxt.options.nitro.experimental || {}

  // Deshabilitar unwasm para evitar conflictos con archivos WASM de Prisma
  nuxt.options.nitro.experimental.wasm = false

  nuxt.options.nitro.esbuild = nuxt.options.nitro.esbuild || {}
  nuxt.options.nitro.esbuild.options = nuxt.options.nitro.esbuild.options || {}
  nuxt.options.nitro.esbuild.options.target = 'esnext'

  // Prisma 7 requiere que el cliente generado y @prisma/client sean externos
  nuxt.options.nitro.externals = nuxt.options.nitro.externals || {}
  nuxt.options.nitro.externals.inline = nuxt.options.nitro.externals.inline || []

  // NO incluir Prisma en inline, debe ser externo
  nuxt.options.nitro.rollupConfig = nuxt.options.nitro.rollupConfig || {}
  nuxt.options.nitro.rollupConfig.external = nuxt.options.nitro.rollupConfig.external || []

  if (Array.isArray(nuxt.options.nitro.rollupConfig.external)) {
    nuxt.options.nitro.rollupConfig.external.push(
      '.prisma/client',
      '@prisma/client',
      '@prisma/client/runtime',
      '@prisma/engines',
    )
  }

  // Excluir archivos WASM de Prisma del procesamiento de Nitro
  nuxt.options.nitro.ignore = nuxt.options.nitro.ignore || []
  nuxt.options.nitro.ignore.push(
    '**/*.wasm',
    '**/wasm/**',
    '**/*wasm-base64*',
  )

  // Configuración de Vite para Prisma 7
  nuxt.options.vite = nuxt.options.vite || {}
  nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}

  // Excluir completamente Prisma de la optimización de Vite
  nuxt.options.vite.optimizeDeps.exclude = nuxt.options.vite.optimizeDeps.exclude || []
  nuxt.options.vite.optimizeDeps.exclude.push(
    '@prisma/client',
    '.prisma/client',
    '@prisma/engines',
  )

  // SSR Configuration
  nuxt.options.vite.ssr = nuxt.options.vite.ssr || {}
  nuxt.options.vite.ssr.external = nuxt.options.vite.ssr.external || []

  if (Array.isArray(nuxt.options.vite.ssr.external)) {
    nuxt.options.vite.ssr.external.push(
      '@prisma/client',
      '.prisma/client',
      '@prisma/engines',
    )
  }

  // Excluir archivos WASM de Vite también
  nuxt.options.vite.assetsInclude = nuxt.options.vite.assetsInclude || []
  if (Array.isArray(nuxt.options.vite.assetsInclude)) {
    nuxt.options.vite.assetsInclude.push('**/*.wasm')
  }
}
