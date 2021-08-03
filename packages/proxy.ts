const { proxy, close } = require('fast-proxy')({
    base: 'http://arweave.dev'
    // options
})
const gateway = require('restana')()

gateway.all('/arweave/*', function (req, res) {
    proxy(req, res, req.url, {})
})


gateway.start(8080)
