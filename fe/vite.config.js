import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const PROJECT_NAME = "tic-tac-toe-tact";
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ],
  base: `/${PROJECT_NAME}`,
  define: {
    global: "globalThis",
  },
});
