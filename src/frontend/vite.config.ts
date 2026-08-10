import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const mockUrl = process.env.MOCK_SERVER_URL;

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL || "/",
  ...(mockUrl && {
    server: {
      proxy: { "/api": { target: mockUrl, changeOrigin: true } },
    },
  }),
});
