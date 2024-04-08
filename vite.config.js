// vite.config.js
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
    resolve: {
        alias: {
            vue: '@vue/compat',
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '/api-token-auth': 'http://localhost:8000',
            '/application-variables': 'http://localhost:8000',
            '/api': 'http://localhost:8000',
            '/api-auth': 'http://localhost:8000',
        }
    },
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    compatConfig: {
                        MODE: 2
                    }
                }
            }
        }),
        VueDevTools()
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