import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { resolve } from 'path'


export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  return {
    plugins: [basicSsl()],
    server: {
      host: true,
      open: true, 
    },
    base: isDev ? './' : '/AppMindAr/', 
    build: {
      outDir: 'docs',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          minas: resolve(__dirname, 'minas.html'),
          elements: resolve(__dirname, 'elements.html'),
          bio: resolve(__dirname, 'bio.html'),
          astro: resolve(__dirname, 'astro.html'),      
          'astro-elements': resolve(__dirname, 'astro-elements.html'),
          'dino-scanner': resolve(__dirname, 'dino-scanner.html'),       
          'bio-elements': resolve(__dirname, 'bio-elements.html'),
          'index-dino':resolve(__dirname, 'index-dino.html'),
          'visor-espacial-astro': resolve(__dirname, 'visor-espacial-astro.html'),
          'visor-espacial-bio': resolve(__dirname, 'visor-espacial-bio.html'),
          'visor-espacial': resolve(__dirname, 'visor-espacial.html'),
          'minerales': resolve(__dirname, 'minerales.html'),
          'minerales-elements': resolve(__dirname, 'minerales-elements.html'),
          'visor-espacial-minerales': resolve(__dirname, 'visor-espacial-minerales.html'),
        },
      },
    },
  }
})
