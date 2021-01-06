'use strict'

// module.exports = neo
// const neo:(opts: any = null) => void = (opts) => {

// }

// import * as Fastify from 'fastify'
// import * as FastifyHttpProxy from 'fastify-http-proxy'
// const server = Fastify()

// server.register(FastifyHttpProxy, {
//   upstream: 'http://172.19.0.4:30333',
//   http2: true, // optional
//   preHandler: async (request, reply) => {
//     // some code
//     console.log(JSON.stringify(request, null, 2))
//   }
// })

//server.listen(3000)

export default (req, res, next) => {
    console.log('NEO HANDLER ..............')
    next()
}
