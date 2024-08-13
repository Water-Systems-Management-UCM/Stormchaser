// vite.config.js

// import vue from '@vitejs/plugin-vue2';
import {defineConfig} from "vite";
import vue from '@vitejs/plugin-vue';
// import vuetify from "./src/plugins/vuetify.js";
import vuetify from 'vite-plugin-vuetify';


export default defineConfig({
    resolve: {
        alias: {
            vue: '@vue/compat',
        },
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
    vue(),
    vuetify()
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