import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5137, //cambiar por el puerto 
    host: true,
    allowedHosts: ["dominio.ejemplo"] //cambiar por el nombre de su dominio
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    }
  }
})
