"use strict"

import fastify, { preHandlerAsyncHookHandler, preHandlerHookHandler, onRequestHookHandler } from 'fastify'
import axios from 'axios'


const getHandler = (handler: string, upstream: string) => {
    const axiosInstance = axios.create({
        baseURL: upstream,
    })

    let preHandler = async (req, res) => {
        switch (req.url) {
            case "/arweave/getFeeees": {
                /**
                   Since we can't easily change `req.method` calling axios manually
                   FIXME: this should be reworked
                   */
                axiosInstance.post(req.path,
                    { "jsonrpc": "2.0", "id": 1, "method": "network_info", "params": [] })
                    .then((response) => {
                        res.send(response.data)
                    })
            }
        }
        return res;
    }
    let handlers = { preHandler }
    return handlers[handler]
}
export { getHandler }

