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
          'astro-scanner': resolve(__dirname, 'astro-scanner.html'),
          'astro-elements': resolve(__dirname, 'astro-elements.html'),
          'dino-scanner': resolve(__dirname, 'dino-scanner.html'),
          'arjs-scanner': resolve(__dirname, 'arjs-scanner.html'),     
          'bio-scanner': resolve(__dirname, 'bio-scanner.html'),
          'bio-elements': resolve(__dirname, 'bio-elements.html'),


        },
      },
    },
  }
})
