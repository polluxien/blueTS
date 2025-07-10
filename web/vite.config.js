import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    base: "",
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            output: {
                // statische Dateinamen ohne Hashfür View
                entryFileNames: "assets/index.js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
});
//# sourceMappingURL=vite.config.js.map