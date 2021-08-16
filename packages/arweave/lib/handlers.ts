"use strict"
const Arweave = require('arweave')
import { JWKInterface } from 'arweave/node/lib/wallet';

export let ar: typeof Arweave.Arweave
import rootLogger from '../../../logger'
import { readJSONFromFileAsync } from '../../../utils';
const logger = rootLogger.child({ defaultMeta: { service: 'arweave-handler' } });
const eth2LocalTable: {}= {
  // Preloading my own keys
  "6C7623EED8FB55DE471B3AFA2F44AFCC2E2946D4": {
    address: "Dwvyt0mjqzrwj62vnucavm6cr1qbuijr5ejqdq43i78",
    jwk: readJSONFromFileAsync('/home/archer/arweave-key-PERSONAL-mRJnY8pQhOBfnU3IsTo6M_yIRyA3TlMjkzYrv0SOrhw.json')
  },
    "D2236A1CCD4CED06E16EB1585C8C474969A6CCFE": {
      address: "mRJnY8pQhOBfnU3IsTo6M_yIRyA3TlMjkzYrv0SOrhw",
      key: readJSONFromFileAsync('/home/archer/arweave-key-BUSINESS-DwVyt0MjqZrwJ62VnUCavm6CR1qBUiJr5Ejqdq43I78.json')
    }

}

export async function init(opts: any = undefined): Promise<string> {
  logger.debug('Initing Arweave with opts:', opts)
  ar = Arweave.init(Object.assign({
    host: process.env.ARWEAVE_HOST || 'arweave.net', // Hostname or IP address for a Arweave host
    port: parseInt(process.env.ARWEAVE_PORT) || 443, // Port
    protocol: process.env.ARWEAVE_PROTOCOL || 'https',  // Network protocol http or https
    timeout: parseInt(process.env.ARWEAVE_TIMEOUT) || 20000,     // Network request timeouts in milliseconds
    logging: process.env.ARWEAVE_LOGGING || false,     // Enable network request logging
  }, opts))

  // waiting for all keys to load
  return Promise.all([
    // Loading Arweave keys
    async () => registerWallet("6C7623EED8FB55DE471B3AFA2F44AFCC2E2946D4", readJSONFromFileAsync('/home/archer/arweave-keyfile-mRJnY8pQhOBfnU3IsTo6M_yIRyA3TlMjkzYrv0SOrhw.json')),
    async () => registerWallet("D2236A1CCD4CED06E16EB1585C8C474969A6CCFE", readJSONFromFileAsync('/home/archer/arweave-key-BUSINESS-DwVyt0MjqZrwJ62VnUCavm6CR1qBUiJr5Ejqdq43I78.json'))
  ])
    .then(() => Promise.resolve("0xbeed0000000000000000000000000000000001"))
}

function eth2local(ethAddress: string): string {
  const sidechainAddress = eth2LocalTable[ethAddress.toUpperCase()].address
  logger.debug(`Found ${ethAddress}:${sidechainAddress}`)
  return sidechainAddress
}

export async function balanceOf(ethAddress: string): Promise<string> {
  const localWalletAddress = eth2local(ethAddress.toUpperCase())
  logger.debug('Looking up for balance on ', localWalletAddress)
  return ar.wallets
    .getBalance(localWalletAddress)
    .then((winstonBalance) => {
      const arBalance: string = ar.ar.winstonToAr(winstonBalance);

      logger.debug('Windows, arBalance balances:', { winstonBalance, arBalance });
      //0.125213858712
      return parseInt(winstonBalance).toString() //FIXME: return arBalance not winstonBalance
    });
}

export async function transfer(fromEthAddress: string, toEthAddress: string, amount: number): Promise<any> {
  const localFromAddress = eth2local(fromEthAddress)
  const localToAddress = eth2local(toEthAddress)
  console.assert(localFromAddress != undefined,
    'localFromAddress should not be undefined')
  console.assert(localToAddress != undefined,
    'localToAddress should not be undefined')

  logger.debug(`going to send transaction from ${localFromAddress} to ${localToAddress} amount: ${amount}`)
  return eth2LocalTable[fromEthAddress.toUpperCase()]
    .jwk
    .then((jwk: JWKInterface) =>
      ar
        .createTransaction({
          target: localToAddress,
          quantity: amount.toString()
        }, jwk)
        .then((tx: any) => {
          return {
            none: ar.transactions.sign(tx, jwk),
            tx
          }
        })
        .catch(logger.error))
        .then(({ tx }) => ar.transactions.post(tx))
}
export async function registerWallet(ethAddress:string, jwk: any) {
  return ar.wallets.jwkToAddress(jwk)
    .then((address:string) => {
      eth2LocalTable[ethAddress.toUpperCase()] = {
        address,
        jwk
      }
    })
}

export function getWalletsRegistered(){
  return eth2LocalTable
}
