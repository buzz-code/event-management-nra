import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path';

export default ({ mode }) => {
    return defineConfig({
        envPrefix: 'REACT_APP',
        plugins: [react()],
        server: {
            port: Number(process.env.PORT || 3000),
            hmr: {
                port: 443,
                protocol: 'wss',
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
