import { resolve } from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        links: resolve(__dirname, "links.html"),
        formulario: resolve(__dirname, "formulario.html"),
        obrigado: resolve(__dirname, "obrigado.html"),
      },
    },
  },
})
