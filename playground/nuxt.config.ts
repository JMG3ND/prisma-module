export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  nitro: {
    experimental: {
      wasm: true,
    },
    externals: {
      inline: ['@prisma/client'],
    },
  },
  myModule: {},
})
