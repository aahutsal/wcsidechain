require('dotenv-flow').config()
import fastify, { FastifyInstance, FastifyLoggerInstance, FastifyLoggerOptions } from 'fastify'

import { Server, IncomingMessage, ServerResponse } from 'http'
import { Transaction } from '@ethereumjs/tx'
import Web3 from 'web3'
import axios from 'axios'

import rootLogger from './logger';
const logger = rootLogger.child({ defaultMeta: { service: 'index' } });

const ax = axios.create({
  baseURL: "http://localhost:1984"
})
// Create a http server. We pass the relevant typings for our http version used.
// By passing types we get correctly typed access to the underlying http objects in routes.
// If using http2 we'd pass <http2.Http2Server, http2.Http2ServerRequest, http2.Http2ServerResponse>

export const server: FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance> = fastify({ logger: {} as FastifyLoggerOptions })

const [host, port] = process.env.PROXY_CONFIG?.split(':')
const handlers: string[] = process.env.PROXY_HANDLERS?.split(' ')

const proxyConfig: any = { host, port, handlers }
const handlerMagicNumbers:any = {}

export function getHandlers():any{
  return handlerMagicNumbers
}
export async function configureServer(): Promise<void> {
  logger.debug('Handers found:', handlers)
  logger.debug('{host, port}:', host, port)
  proxyConfig.handlers.forEach(async (handlerConfig: string) => {
    const [upstream, preHandlerJS] = handlerConfig.split(',')
    const [ protocol, host, port ] = upstream.split(/\:\/\/|\:/)
    logger.info(`handler {preHandlerJS} decorating`, { upstream, preHandlerJS, protocol, host, port })
    const handler = require(preHandlerJS)
    let opts:any = { protocol, host, port }
    const handlerAddress = await handler.init(opts)
    console.log("Adding handlerMagicNumberf, handlerAddress")
    handlerMagicNumbers[handlerAddress] = handler
  })
  logger.debug('MAGIC NUMBERS', handlerMagicNumbers)
}

export async function jsonRpc20Processor(req: { body: any; }): Promise<any> {
  const reqBody = req.body
  let { jsonrpc, id, method, params }: any = reqBody

  logger.debug('jsonRpc20Processor:', { jsonrpc, id, method, params })
  switch (method) {
    case 'eth_chainId': return {
      id, jsonrpc, result: "0x540"
    }
    case 'net_version': return {
      id, jsonrpc, result: "1"
    }
    case 'eth_gasPrice': return {
      id, jsonrpc, result: "0x0"
    }

    case 'eth_estimateGas': return {
      id, jsonrpc, result: "0x5208"
    }
    case 'eth_sendRawTransaction': {
      function decodeTx(hex: string):Transaction {
        var buf = Buffer.from(hex.slice(2), 'hex');
        var tx = Transaction.fromSerializedTx(buf)
       //logger.debug('tx', tx)
        return tx
      };

      var tx: Transaction = decodeTx(params[0])
      logger.info('Sending transaction', handlerMagicNumbers)

      const contractAddress = tx.to.toString();
      const senderAddress = tx.getSenderAddress().toString().substring(2)
      const hexData = tx.data.toString('hex');
      const rcptAddress = hexData.substring(32, 32 + 40)
      // TODO: make sure we should scan starting from 50th symbol
      const amountWinston = parseInt(tx.data.toString('hex', 50), 16)
      const handler: any = handlerMagicNumbers[contractAddress]
      if (!handler) {
        logger.debug(`Handler ${contractAddress} not found`)
        break;
      }
      logger.debug("******************************************")
      logger.debug(`Contract transaction is about to be sent`)
      logger.debug(`transfer(${senderAddress}, ${rcptAddress}, ${amountWinston})`)
      logger.debug("...waiting for receipt.")
      logger.debug("******************************************")

      const response:any = await handler
        .transfer(senderAddress, rcptAddress, amountWinston)
        .catch((error:any) => {
          logger.error('Problem with eth_sendRawTransaction', error)
          throw new Error(error)
        })
      // const response = await new Promise((resolve, reject) => setTimeout(resolve, 30000))

      logger.debug("******************************************")
      logger.debug(`Contract transaction is sent, tx received ${response}`)
      logger.debug("******************************************")

      return {
        id, jsonrpc,
        result: "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331"
      }
      // break; // allowing transaction to execute further

      // return web3.eth.sendSignedTransaction(Transaction.fromTxData({
      //   id,
      //   jsonrpc,

      // }))
      //   .on('receipt', (receipt: any): any => {
      //     logger.debug('Receipt: ', receipt);
      //     return receipt
      //   })
      //   .catch((error: { message: any; }): void => { logger.debug('Error: ', error.message); })
      // else {
     //    logger.debug("******************************************");
     //    logger.debug("You can for instance send this transaction manually with the following command:");
     //    logger.debug("curl -X POST --data '{\"jsonrpc\":\"2.0\",\"method\":\"eth_sendRawTransaction\",\"params\":[\"" + rawTxHex + "\"],\"id\":1}'", provider);

      //   return {
      //     id, jsonrpc,
      //     value:

      //   //0xf88380018203339407a565b7ed7d7a678680a4c162885bedbb695fe080a44401a6e4000000000000000000000000000000000000000000000000000000000000001226a0223a7c9bcf5531c99be5ea7082183816eb20cfe0bbc322e97cc5c7f71ab8b20ea02aadee6b34b45bb15bc42d9c09de4a6754e7000908da72d48cc7704971491663
      // }
    }
    case 'eth_call': {
      const { to, data } = params[0]
      const ethWalletAddress = data.substring(34);

      logger.debug("to, data", { to, data })
      const handler: any = handlerMagicNumbers[to]
      if (!handler){
        logger.debug(`Handler ${to} not found`)
        break;
      }
      if (data.startsWith(Web3.utils.sha3("balanceOf(address)").substring(0, 10)))
        return handler.balanceOf(ethWalletAddress)
          .then((balance: string) => {
            return {
              jsonrpc,
              id,
              result: parseInt(balance).toString(16)
            }
          })
          .catch((reason) => logger.error("Catch handler:", reason))
      else if (data.startsWith(Web3.utils.sha3("decimals()").substring(0, 10)))
        return {
          jsonrpc,
          id,
          result: 8
        }
      // else if (data.startsWith(Web3.utils.sha3("transfer(address,address)").substring(0, 10)))
        // return handler.transfer(ethWalletAddress, ){
        //   jsonrpc,
        //   id,
        //   tx
        // }
      // // SOLANA
      // case "0xbeed000000000000000000000000000000000002":
      //   return axios
      //     .post("http://api.devnet.solana.com/",
      //       {
      //         jsonrpc,
      //         id,
      //         method: "getBalance",
      //         params: [ethAddressToSidechainAddress(walletAddress, to)]
      //       })
      //     .then(resp => {
      //       return {
      //         id, jsonrpc,
      //         result: "0x" + resp.data.result.value.toString(16)
      //       }
      //     })
      //     .catch(logger.error)
      else throw Error('Not implemented yet')
    }
  }
  // calling this by default if not handled sooner
  logger.debug("Calling default handler:", process.env.ETHEREUM_UPSTREAM)
  logger.debug("POST body:", reqBody)
  return ax.post(process.env.ETHEREUM_UPSTREAM, reqBody).then(resp => {
    logger.debug("RESPONSE:", resp.data)
    return resp.data
  })
}


if (process.env.NODE_ENV !== 'test') {
  configureServer()
    .then(() => {
      logger.debug('Server configured:', handlerMagicNumbers)
      server.post('/wcsidechain', jsonRpc20Processor)

      server.listen(parseInt(proxyConfig.port) || 3000, proxyConfig.host || '0.0.0.0')
    })
}

