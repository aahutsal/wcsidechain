"use strict"
const Arweave = require('arweave')
import { JWKInterface } from 'arweave/node/lib/wallet'
export let ar: typeof Arweave.Arweave

import { readJSONFromFileAsync } from '../../../utils'

import rootLogger from '../../../logger'
const logger = rootLogger.child({ defaultMeta: { service: 'arweave-handler' } })

const eth2LocalTable: any = {
}


export async function registerWallet(ethAddress: string, jwkPromise: Promise<JWKInterface>) {
  return jwkPromise
    .then((jwk) => ar.wallets.jwkToAddress(jwk)
      .then((address: string) => {
        eth2LocalTable[ethAddress.toUpperCase()] = {
          address,
          jwk
        }
      }))
}

export function getWalletsRegistered() {
  return eth2LocalTable
}

export async function init(opts: any = undefined): Promise<string> {
  opts = Object.assign({
    host: process.env.ARWEAVE_HOST || 'arweave.net', // Hostname or IP address for a Arweave host
    port: parseInt(process.env.ARWEAVE_PORT) || 443, // Port
    protocol: process.env.ARWEAVE_PROTOCOL || 'https',  // Network protocol http or https
    timeout: parseInt(process.env.ARWEAVE_TIMEOUT) || 20000,     // Network request timeouts in milliseconds
    logging: process.env.ARWEAVE_LOGGING || false,     // Enable network request logging
  }, opts)
  logger.debug('Initing Arweave with opts:', opts)
  ar = Arweave.init(opts)

  // waiting for all keys to load
  return Promise.all(
    process.env.ARWEAVE_PRELOAD_KEYS?.split(" ")
      .map(k => k.split(":"))
      .map((([address, keyFile]) => registerWallet(address, readJSONFromFileAsync(keyFile))))
  )
    .then(() => Promise.resolve("0xbeed000000000000000000000000000000000001"))
}

function eth2local(ethAddress: string): string {
  const sidechainAddress = eth2LocalTable[ethAddress.toUpperCase()].address
  logger.debug(`Found ${ethAddress}:${sidechainAddress}`)
  return sidechainAddress
}
export async function balanceOf(ethAddress: string): Promise<string> {
  const localWalletAddress = eth2local(ethAddress)
  logger.debug(`Looking up for balance on ${localWalletAddress}`)
  return ar.wallets
    .getBalance(localWalletAddress)
    // .then((winstonBalance) => {
    //   const arBalance: string = ar.ar.winstonToAr(winstonBalance);
    //   logger.debug('Windows, arBalance balances:', { winstonBalance, arBalance });
    //   //0.125213858712
    //   return parseInt(winstonBalance).toString() //FIXME: return arBalance not winstonBalance
    // });
}

export async function decimals():Promise<number> {
  return Promise.resolve(18)
}
export async function transfer(fromEthAddress: string, toEthAddress: string, amount: number): Promise<any> {
  const localFromAddress = eth2local(fromEthAddress)
  const localToAddress = eth2local(toEthAddress)
  console.assert(localFromAddress != undefined,
    'localFromAddress should not be undefined')
  console.assert(localToAddress != undefined,
    'localToAddress should not be undefined')

  logger.debug(`going to send transaction from ${localFromAddress} to ${localToAddress} amount: ${amount}`)
  return Promise.resolve(eth2LocalTable[fromEthAddress.toUpperCase()].jwk)
    .then((jwk: JWKInterface) => ar.createTransaction({
          target: localToAddress,
          quantity: amount.toString()
    }, jwk)
    .then(async (tx: any) => {
      return ar.transactions.sign(tx, jwk)
        .then(() => ar.transactions.post(tx))
    }))
}
