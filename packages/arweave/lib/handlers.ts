"use strict"

import fastify, { preHandlerAsyncHookHandler, preHandlerHookHandler, onRequestHookHandler, FastifyLoggerInstance, FastifyInstance, FastifyLoggerOptions } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'

import axios from 'axios'
import web3 from 'web3'
const Arweave = require('arweave')

const ai = axios.create({ baseURL: 'https://arweave.dev/' })
const ar = Arweave.init({})

async function jsonRpc20Processor(req): Promise<any> {
  const reqBody = req.body
  let { jsonrpc, id, method, params }: any = reqBody

  jsonrpc = "2.0"
  params = params || []
  console.log({ jsonrpc, id, method, params })
  switch (method) {
    case 'net_version': return {
      id, jsonrpc, result: "1"
    }
    case 'eth_call': {
      const { to, data } = params[0]
      if (data.startsWith(web3.utils.sha3("balanceOf(address)").substring(0, 10)))
        return ai.get("http://arweave.dev/wallet/mRJnY8pQhOBfnU3IsTo6M_yIRyA3TlMjkzYrv0SOrhw/balance").then(resp => {
          const cr = {
            id, jsonrpc,
            result: "0x" + resp.data.toString(16)
          }

          console.log("CUSTOM_RESPONSE:", cr)
          return cr
        })
      else {
        return axios.post("http://localhost:8545", reqBody).then(resp => {
          console.log("RESPONSE:", resp.data)
          return resp.data
        })
      }

    };
    default:
      return axios.post("http://localhost:8545", reqBody).then(resp => {
        console.log("RESPONSE:", resp.data)
        return resp.data
      })
  }
}


function decorateServer(server: FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance>, prefix: string, upstream: string): any {
  console.log(upstream)
  server.post('/arweave', jsonRpc20Processor)
}

export { decorateServer, jsonRpc20Processor }
