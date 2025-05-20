module.exports = {
    extends: [
        'plugin:vue/base',
    ],
    settings: {
        'import/resolver': {
            alias: {
                map: [['@', './src/']],
                extensions: ['.js', '.vue'],
            },
        }
    }
}