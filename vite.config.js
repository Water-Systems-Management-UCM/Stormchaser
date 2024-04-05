// vite.config.js

import vue from '@vitejs/plugin-vue2';
import {defineConfig} from "vite";

export default defineConfig({
    server: {
        proxy: {
            '/api-token-auth': 'http://localhost:8000',
            '/application-variables': 'http://localhost:8000',
            '/api': 'http://localhost:8000',
            '/api-auth': 'http://localhost:8000',
        }
    },
    plugins: [
        vue(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    plotly: ['plotly.js'],
                    vue_plotly: ['@wellcaffeinated/vue-plotly'],
                    leaflet: ['vue2-leaflet'],
                    choropleth: ['vue-choropleth'],
                }
            }
        }
    }
})