"use strict"

import fastify, { preHandlerAsyncHookHandler, preHandlerHookHandler, onRequestHookHandler, FastifyLoggerInstance, FastifyInstance, FastifyLoggerOptions } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'

import axios from 'axios'
import web3 from 'web3'
const Arweave = require('arweave')

const ai = axios.create({ baseURL: 'https://arweave.dev/' })
const ar = Arweave.init({})
import rootLogger from '../../logger'
const logger = rootLogger.child({ defaultMeta: { service: 'arweave-handler' } });

function ethAddressToSidechainAddress(ethAddress: string, sidechainContract: string): string {
  logger.debug('Looking up for ', ethAddress)
  switch (sidechainContract) {
    case "0xbeed000000000000000000000000000000000001":
      switch (ethAddress) {
        case "6c7623eed8fb55de471b3afa2f44afcc2e2946d4": return "mRJnY8pQhOBfnU3IsTo6M_yIRyA3TlMjkzYrv0SOrhw";
        default: throw Error(`Address "$ethAddress" not found in address table`)
      }
    case "0xbeed000000000000000000000000000000000002":
          switch (ethAddress) {
            case "6c7623eed8fb55de471b3afa2f44afcc2e2946d4": return "83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri"
            default: throw Error(`Address "$ethAddress" not found in address table`)
          }
      }
}
async function jsonRpc20Processor(req): Promise<any> {
  const reqBody = req.body
  let { jsonrpc, id, method, params }: any = reqBody

  logger.debug('jsonRpc20Processor:', { jsonrpc, id, method, params })
  switch (method) {
    case 'net_version': return {
      id, jsonrpc, result: "1"
    };
    case 'eth_call': {
      const { to, data } = params[0]
      const walletAddress = data.substring(34);
      logger.debug("to, data", {to, data})

      if (data.startsWith(web3.utils.sha3("balanceOf(address)").substring(0, 10)))
        switch (to) {
          // ARWEAVE
          case "0xbeed000000000000000000000000000000000001":
            return axios
                .get("http://arweave.net/wallet/" + ethAddressToSidechainAddress(walletAddress, to) + "/balance")
                .then(resp => {
                  return {
                    jsonrpc,
                    id,
                    result: "0x" + resp.data.toString(16)
                  }
                })
                .catch(logger.error)
          // SOLANA
          case "0xbeed000000000000000000000000000000000002":
            return axios
              .post("http://api.devnet.solana.com/",
                {
                  jsonrpc,
                  id,
                  method: "getBalance",
                params: [ethAddressToSidechainAddress(walletAddress, to)]
              })
              .then(resp => {
                return {
                  id, jsonrpc,
                  result: "0x" + resp.data.result.value.toString(16)
                }
              })
              .catch(logger.error)
        }
      else {
        return axios
          .post("http://localhost:8545", reqBody)
          .then(resp => {
            logger.debug("RESPONSE:", resp.data)
            return resp.data
          })
      }
    };
    default:
      return axios.post("http://localhost:8545", reqBody).then(resp => {
        logger.debug("RESPONSE:", resp.data)
        return resp.data
      })
  }
}


function decorateServer(server: FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance>, prefix: string, upstream: string): any {
  logger.debug(upstream)
  server.post('/arweave', jsonRpc20Processor)
}

export { decorateServer, jsonRpc20Processor }
