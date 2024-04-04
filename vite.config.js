// vite.config.js

import vue from '@vitejs/plugin-vue2';

export default {
    server: {
        proxy: {
            '/api-token-auth': 'http://localhost:8000',
            '/application-variables': 'http://localhost:8000',
            '/api': 'http://localhost:8000',
            '/api-auth': 'http://localhost:8000',
        }
    },
    plugins: [
        vue()
    ]
}