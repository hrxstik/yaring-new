// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url';

const stylesDir = fileURLToPath(new URL('./app/assets/styles', import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/styles/main.scss'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
      yandexMapsKey: process.env.NUXT_PUBLIC_YANDEX_MAPS_KEY ?? '',
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [stylesDir],
          additionalData: `@use "${stylesDir.replace(/\\/g, '/')}/shared" as *;\n`,
        },
      },
    },
  },
  app: {
    head: {
      title: 'Яринг — база отдыха',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap',
        },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'База отдыха Яринг — бронирование домиков, бани и беседок',
        },
      ],
    },
  },
});
