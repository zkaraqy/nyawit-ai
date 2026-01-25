import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@tresjs/nuxt'
  ],
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  build: {
    transpile: ['sequelize', 'pg', 'pg-connection-string']
  },
  nitro: {
    alias: {
      'pg-native': 'unenv/runtime/mock/proxy',
      'pg-hstore': 'unenv/runtime/mock/proxy',
    },
    rollupConfig: {
      external: ['pg-native', 'pg-hstore'],
    },
  },
})