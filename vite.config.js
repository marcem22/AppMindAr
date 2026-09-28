import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { resolve } from 'path'


export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  return {
    plugins: isDev ? [basicSsl()] : [],
    server: {
      host: true,
      open: true,
    },
    base: isDev ? './' : '/AppMindAr/',
    build: {
      outDir: 'docs',
      cssCodeSplit: true,
      modulePreload: { polyfill: true },
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          category: resolve(__dirname, 'src/pages/category.html'),
          elements: resolve(__dirname, 'src/pages/elements.html'),
          visorEspacial: resolve(__dirname, 'src/pages/visor-espacial.html'),
        },
        output: {
          manualChunks(id) {
            if (id.includes('src/data.js') || id.includes('src\\data.js')) return 'data'
            if (id.includes('src/js/tutorial.js') || id.includes('src\\js\\tutorial.js')) return 'tutorial'
          },
        },
      },
    },
  }
})
