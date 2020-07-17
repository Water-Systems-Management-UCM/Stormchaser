module.exports = {
    configureWebpack: {
        devServer: {
            headers: { "Access-Control-Allow-Origin": "*" },
            proxy: 'http://localhost:8000'  // make the API available by proxying non-static-file requests to here - we'll need to deal with this differently for the final app
        }
    }
};