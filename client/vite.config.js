import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path';

export default ({ mode }) => {
    return defineConfig({
        envPrefix: 'REACT_APP',
        plugins: [react()],
        server: {
            host: '0.0.0.0',
            port: Number(process.env.PORT || 3000),
            hmr: {
                overlay: true,
                port: 24678,
                timeout: 1000,
                clientPort: 24678,
                host: 'localhost',
            },
        },
        define: {
            "process.env.NODE_ENV": `"${mode}"`,
            "process.env.REACT_APP_API_URL": `"${process.env.REACT_APP_API_URL ?? ''}"`,
        },
        resolve: {
            alias: {
                '@shared': path.resolve(__dirname, './shared'),
                'src': path.resolve(__dirname, './src')
            },
        },
        build: {
            rollupOptions: {
                onwarn(warning, warn) {
                    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                        return
                    }
                    warn(warning)
                }
            }
        },
    })
}
