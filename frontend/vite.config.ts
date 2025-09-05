import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // El alias '@' debe apuntar al directorio 'src'
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
