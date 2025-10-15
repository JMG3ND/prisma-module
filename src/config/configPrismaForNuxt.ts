import type { Nuxt } from 'nuxt/schema'

export function configPrismaForNuxt(nuxt: Nuxt) {
  // Configuración automática de Nitro para Prisma
  nuxt.options.nitro = nuxt.options.nitro || {}
  nuxt.options.nitro.experimental = nuxt.options.nitro.experimental || {}

  // Habilita el soporte para WebAssembly en Nitro
  // Prisma Client utiliza WebAssembly para algunas operaciones de base de datos
  // especialmente en entornos serverless donde el rendimiento es crítico
  nuxt.options.nitro.experimental.wasm = true

  nuxt.options.nitro.esbuild = nuxt.options.nitro.esbuild || {}
  nuxt.options.nitro.esbuild.options = nuxt.options.nitro.esbuild.options || {}

  // Establece el target de compilación a 'esnext' para compatibilidad con Prisma
  // Prisma Client requiere características modernas de JavaScript que están disponibles
  // en versiones recientes de Node.js, por eso necesitamos 'esnext'
  nuxt.options.nitro.esbuild.options.target = 'esnext'

  nuxt.options.nitro.rollupConfig = nuxt.options.nitro.rollupConfig || {}
  nuxt.options.nitro.rollupConfig.external = nuxt.options.nitro.rollupConfig.external || []

  // Marca los módulos de Prisma como externos para evitar que sean bundleados
  // Esto es necesario porque Prisma Client incluye binarios nativos que no pueden
  // ser procesados por bundlers y deben mantenerse como dependencias externas
  if (Array.isArray(nuxt.options.nitro.rollupConfig.external)) {
    nuxt.options.nitro.rollupConfig.external.push('.prisma/client', '@prisma/client')
  }
  else {
    nuxt.options.nitro.rollupConfig.external = ['.prisma/client', '@prisma/client']
  }

  nuxt.options.nitro.rollupConfig.output = nuxt.options.nitro.rollupConfig.output || {}

  // Crea un chunk manual específico para Prisma para optimizar el bundling
  // Esto agrupa todo el código relacionado con Prisma en un chunk separado,
  // mejorando el cache y la carga de la aplicación
  nuxt.options.nitro.rollupConfig.output.manualChunks = (id) => {
    if (id.includes('@prisma/client') || id.includes('.prisma')) {
      return 'prisma'
    }
  }

  nuxt.options.nitro.moduleSideEffects = nuxt.options.nitro.moduleSideEffects || []

  // Marca @prisma/client como un módulo con side effects
  // Esto evita que el tree-shaking elimine código importante de Prisma
  // que podría parecer no utilizado pero es necesario para el funcionamiento
  nuxt.options.nitro.moduleSideEffects.push('@prisma/client')

  // Configuración automática de Vite para Prisma
  nuxt.options.vite = nuxt.options.vite || {}

  nuxt.options.vite.define = nuxt.options.vite.define || {}

  // Define 'global' como 'globalThis' para compatibilidad entre entornos
  // Prisma Client a veces usa la variable global 'global' que no existe
  // en todos los entornos, por eso la mapeamos a 'globalThis'
  nuxt.options.vite.define.global = 'globalThis'

  nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}
  nuxt.options.vite.optimizeDeps.include = nuxt.options.vite.optimizeDeps.include || []

  // Incluye @prisma/client en la optimización de dependencias de Vite
  // Esto permite que Vite pre-procese y optimice Prisma Client para un mejor rendimiento
  // durante el desarrollo y construcción
  nuxt.options.vite.optimizeDeps.include.push('@prisma/client')

  nuxt.options.vite.optimizeDeps.exclude = nuxt.options.vite.optimizeDeps.exclude || []

  // Excluye .prisma/client de la optimización porque contiene código generado
  // que no debe ser procesado por Vite ya que puede causar problemas de compatibilidad
  nuxt.options.vite.optimizeDeps.exclude.push('.prisma/client')

  nuxt.options.vite.ssr = nuxt.options.vite.ssr || {}
  nuxt.options.vite.ssr.noExternal = nuxt.options.vite.ssr.noExternal || []

  // Marca @prisma/client como no-external para SSR
  // Esto significa que Vite procesará este módulo durante el server-side rendering
  // en lugar de tratarlo como una dependencia externa
  if (Array.isArray(nuxt.options.vite.ssr.noExternal)) {
    nuxt.options.vite.ssr.noExternal.push('@prisma/client')
  }

  nuxt.options.vite.ssr.external = nuxt.options.vite.ssr.external || []

  // Marca .prisma/client como external para SSR
  // El cliente generado debe mantenerse externo durante SSR para evitar
  // problemas con los binarios nativos y el código generado específico
  if (Array.isArray(nuxt.options.vite.ssr.external)) {
    nuxt.options.vite.ssr.external.push('.prisma/client')
  }

  nuxt.options.vite.resolve = nuxt.options.vite.resolve || {}
  nuxt.options.vite.resolve.alias = nuxt.options.vite.resolve.alias || {}

  // Crea un alias para resolver el cliente de Prisma en entornos de navegador
  // Redirige las importaciones del cliente de navegador al cliente estándar
  // para evitar problemas de resolución de módulos en el lado del cliente
  ;(nuxt.options.vite.resolve.alias as Record<string, string>)['.prisma/client/index-browser'] = '.prisma/client/index.js'
}
