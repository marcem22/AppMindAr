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
          category: resolve(__dirname, 'src/pages/category.html'),
          elements: resolve(__dirname, 'src/pages/elements.html'),
        },
      },
    },
  }
})
