import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

export default defineConfig({
  root: 'android-entry',
  plugins: [
    TanStackRouterVite({ routesDirectory: path.resolve(__dirname, 'src/routes'), generatedRouteTree: path.resolve(__dirname, 'src/routeTree.gen.ts') }),
    react(),
    tailwindcss(),
    tsconfigPaths({ root: path.resolve(__dirname) }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname),
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  }
});
