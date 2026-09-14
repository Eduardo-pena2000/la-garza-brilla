import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    // @ts-expect-error tanstackStart typing issue
    tanstackStart({ ssr: false }),
    nitro(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
