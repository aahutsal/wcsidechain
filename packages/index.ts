// Object.defineProperty('exports', "__esModule", { value: true })
// process.env.PROXY_CONFIG='solana:3000,https://api.mainnet-beta.solana.com,../solana/lib/handlers'

import fastify, { FastifyInstance, FastifyLoggerInstance, FastifyLoggerOptions } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import fastifyHttpProxy, { FastifyHttpProxyOptions } from 'fastify-http-proxy'

// Create a http server. We pass the relevant typings for our http version used.
// By passing types we get correctly typed access to the underlying http objects in routes.
// If using http2 we'd pass <http2.Http2Server, http2.Http2ServerRequest, http2.Http2ServerResponse>

const server: FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance> = fastify({logger:{}})

const [host, port] = process.env.PROXY_CONFIG?.split(':')
const handlers:string[] =  process.env.PROXY_HANDLERS?.split(' ')

const proxyConfig:any = { host, port, handlers }


proxyConfig.handlers.forEach((handlerConfig:string) => {
    const [prefix, upstream, preHandlerJS] = handlerConfig.split(',')

    const { getHandler } = require(preHandlerJS)
    // /api/x will be proxied to http://my-api.example.com/x
    server.register(fastifyHttpProxy, {
        upstream: upstream,
        prefix: prefix, // optional
        rewritePrefix: '/', // optional
        http2: false, // optional
        preHandler: getHandler('preHandler', upstream),
    })
})


server.listen(parseInt(proxyConfig.port) || 3000, proxyConfig.host || '0.0.0.0')
