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
    '@tresjs/nuxt',
    '@pinia/nuxt',
  ],

  css: ['./app/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      allowedHosts: true // Mengizinkan tunnel seperti ngrok
    }
  },

  runtimeConfig: {
    // Server-only (private) keys
    sessionSecret: process.env.NUXT_SESSION_SECRET || 'dev-secret-key-min-32-characters-long',
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY || '',
    midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    // Client-exposed (public) keys
    public: {
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    },
  },
})