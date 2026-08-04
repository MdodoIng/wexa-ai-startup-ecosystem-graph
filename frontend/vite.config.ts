import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.API_URL,
        changeOrigin: true,
      },
    },
  },
    ssr: {
    noExternal: ["three-forcegraph", "react-force-graph-3d", "three-spritetext"]
  }
});
