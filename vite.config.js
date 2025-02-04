import {defineConfig} from "vite";
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';


export default defineConfig({
    resolve: {
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
    vuetify({autoImport: true})
  ],
    build: {
       rollupOptions: {
           // external: ['vue'],
           output: {
               globals: {
                   vue: 'Vue'
               }
           }
       }
    }
})