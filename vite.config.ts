import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1", // Alterado de "::" para "127.0.0.1" para estabilidade
    port: 8080,
  },
  // plugins: [react(), mode === "development" && componentTagger()].filter(Boolean), // Desabilitado
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
