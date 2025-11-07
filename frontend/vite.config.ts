import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const backendTarget = process.env.VITE_BACKEND_URL ?? process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/openai-chatkit-advanced-samples/' : '/',
  plugins: [react()],
  server: {
    port: 5170,
    host: "0.0.0.0",
    proxy: {
      "/chatkit": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/api/chatkit/session": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/facts": {
        target: backendTarget,
        changeOrigin: true,
      },
    },
    // For production deployments, you need to add your public domains to this list
    allowedHosts: [
      "gatethegreat.github.io",
      ".ngrok.io",
      ".trycloudflare.com",
    ],
  },
});
