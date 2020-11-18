'use strict';

// module.exports = neo;
// const neo:(opts:any = null) => void = (opts) => {

// }

const Fastify = require('fastify')
const server = Fastify()

server.register(require('fastify-http-proxy'), {
  upstream: 'http://172.19.0.4:30333',
  http2: true // optional
})

server.listen(3000)
