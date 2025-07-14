import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                entryFileNames: `assets/index.js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: ({ name }) => {
                    if (name && name.endsWith('.css')) {
                        return 'assets/index.css';
                    }
                    return 'assets/[name].[ext]';
                }
            }
        }
    }
});
//# sourceMappingURL=vite.config.js.map