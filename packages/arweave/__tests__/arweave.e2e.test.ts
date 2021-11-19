import { ar, getWalletsRegistered, init, balanceOf, registerWallet } from '../lib/handlers'

import { randomBytes } from 'crypto'
import { server, configureServer, getHandlers, jsonRpc20Processor } from '../../../index'
import { promisify } from 'util';
const { toChecksumAddress, BN } = require("ethereumjs-util");
import logger from '../../../logger'
import Ganache from 'ganache-core'

import TestWeave from 'testweave-sdk';

// Web3.prototype.setProvider(require("ganache-cli").provider())
logger.debug('PROCESS.ENV', process.env)
// init TestWeave on the top of arweave

// 0x06fdde03 -> [ function ] name
// 0x095ea7b3 -> [ function ] approve
// 0x18160ddd -> [ function ] totalSupply
// 0x23b872dd -> [ function ] transferFrom
// 0x313ce567 -> [ function ] decimals
// 0x475a9fa9 -> [ function ] issueTokens
// 0x70a08231 -> [ function ] balanceOf
// 0x95d89b41 -> [ function ] symbol
// 0xa9059cbb -> [ function ] transfer
// 0xdd62ed3e -> [ function ] allowance
// 0xddf252ad -> [ event ] Transfer
// 0x8c5be1e5 -> [ event ] Approval

const FakeRequest = {
  id: randomBytes(16).toString('hex'),
  jsonrpc: "2.0",
  method: "",
}
let GServer
let accounts:any[], addresses:string[] // global ganache-provided accounts and its addresses

describe('wcsidechain/arweave e2e', () => {
  let initResult
  let testWeave:TestWeave

  beforeAll(async (done) => {
    jest.setTimeout(60000)
exports
    var options = {
      port: 8545,
      hostname: 'localhost',
      debug: false,
      // seed: argv.s,
      // mnemonic: argv.m,
      // total_accounts: argv.a,
      // default_balance_ether: argv.e,
      // blockTime: argv.b,
      // gasPrice: argv.g,
      // gasLimit: argv.l,
      // callGasLimit: argv.callGasLimit,
      // accounts: parseAccounts(argv.account),
      // unlocked_accounts: argv.unlock,
      // fork: argv.f,
      // forkCacheSize: argv.forkCacheSize,
      // hardfork: argv.k,
      // network_id: argv.i,
      // verbose: argv.v,
      // secure: argv.n,
      // db_path: argv.db,
      // hd_path: argv.hdPath,
      // account_keys_path: argv.account_keys_path,
      // vmErrorsOnRPCResponse: !argv.noVMErrorsOnRPCResponse,
      // logger: logger,
      // allowUnlimitedContractSize: argv.allowUnlimitedContractSize,
      // time: argv.t,
      // keepAliveTimeout: argv.keepAliveTimeout,
      // _chainId: argv.chainId,
      // // gross!
      // _chainIdRpc: argv.chainId
    }

    initResult = await init({
      host: 'localhost',
      port: 1984,
      protocol: 'http',
      timeout: 20000,
      logging: false
    })
    testWeave = await TestWeave.init(ar);

    GServer = Ganache.server(options)
    return promisify(GServer.listen)(options)
      .then((result) => {
        const state: typeof GServer.provider.manager.state = result ? result : GServer.provider.manager.state;

        accounts = state.accounts;
        addresses = Object.keys(accounts);
        var ethInWei = new BN("1000000000000000000");

        addresses.forEach(function(address:string, index) {
          var balance = new BN(accounts[address].account.balance);
          var strBalance = balance.divRound(ethInWei).toString();
          var about = balance.mod(ethInWei).isZero() ? "" : "~";
          var line = `(${index}) ${toChecksumAddress(address)} (${about}${strBalance} ETH)`;

          if (state.isUnlocked(address) == false) {
            line += " 🔒";
          }

          logger.debug(line);
        });
      })
      .then(() => configureServer().then(done))
  })

  afterAll((done) => {
    logger.debug('CLOSING SERVERS');
    return promisify(GServer.close)().
      then(() => server.close().then(done))
  })

  it('testing testWave setup', async () => {
    jest.setTimeout(5000) // allowing 5 seconds for test to complete
    const donation: number = 20000
    return ar.wallets.generate()
      .then((jwk: any) => ar.wallets.jwkToAddress(jwk))
      .then((address: string) => {
        return ar.wallets.getBalance(address)
          .then(it => expect(it).toEqual("0"))
          .then(() => testWeave.drop(address, donation.toString()))
          .then(() => ar.wallets.getBalance(address))
          .then(it => expect(parseInt(it)).toEqual(donation))
      })
  })

  it('eth_sendRawTransaction', async (done) => {
    const fakeRequest = ({
      ...FakeRequest,
      method: "eth_sendRawTransaction",
      // nonce == 0 here
      params: ["0xf8a68080827d2294beed00000000000000000000000000000000000180b844a9059cbb000000000000000000000000beed0000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000820a95a0491938312b37e2aad5b9b6ecb4a57f2c42a22493936c9f532fcf2b3eddecfe93a067a5036d389ecbdfa8ed17d6fbd18d65da8443f534d665307d9b7ab05757a27f"]

    })
    return jsonRpc20Processor({ body: fakeRequest })
      .then((response: any) => {
        expect(response.error).toBeUndefined()
        expect(response).toHaveProperty('result')
        expect(response.result).toBeDefined()
        return response
      })
      .catch(fail).finally(done)
  })

  it('eth_call ARWEAVE balanceOf empty wallet', async (done) => {
    return jsonRpc20Processor({
      body: {
        id: '0x' + randomBytes(16).toString('hex'),
        method: 'eth_getTransactionCount',
        params: ["0xbeed000000000000000000000000000000000001", 'latest']
      }
    })
      .then((response: any) =>
        jsonRpc20Processor({
          body: {
            ...FakeRequest,
            method: "eth_call",
            // Filling eth_call requesting `AR` address balance
            params: [{
              to: "0xbeed000000000000000000000000000000000001",
              data: "0x70a08231000000000000000000000000d2236a1ccd4ced06e16eb1585c8c474969a6ccfe"
            }, response.value]
          }
        }))
      .then(response => {
        console.debug("response:", response)
        return response
      })
      .then((response: any) => {
        expect(response).toBeDefined()
        expect(response).toHaveProperty('result')
        expect(response.result).toEqual('0x')
      })
      .catch(fail).finally(done)
  })
  it('eth_call ARWEAVE balanceOf non-empty wallet', async (done) => {
    const localEthAddress = "d2236a1ccd4ced06e16eb1585c8c474969a6ccfe";

    await registerWallet(localEthAddress, ar.wallets.generate())
    const localArAddress = getWalletsRegistered()[localEthAddress.toUpperCase()].address;

    const szDonation = '20000';
    const decBalance = szDonation;
    const hexBalance = '0x' + parseInt(decBalance).toString(16)
    return testWeave
      .drop(localArAddress,  szDonation)
      .then(() => balanceOf(localEthAddress))
      .then((szBalance) => expect(szBalance).toEqual(szDonation))
      .then( () => jsonRpc20Processor({
      body: {
        id: '0x' + randomBytes(16).toString('hex'),
        method: 'eth_getTransactionCount',
        params: ["0xbeed000000000000000000000000000000000001", 'latest']
      }
    })
      .then((response: any) =>
        jsonRpc20Processor({
          body: {
            ...FakeRequest,
            method: "eth_call",
            // Filling eth_call requesting `AR` address balance
            params: [{
              to: "0xbeed000000000000000000000000000000000001",
              data: "0x70a08231000000000000000000000000d2236a1ccd4ced06e16eb1585c8c474969a6ccfe"
            }, response.value]
          }
        }))
      .then(response => {
        console.debug("response:", response)
        return response
      })
      .then((response: any) => 
        ar.wallets.getBalance(localArAddress)
          .then((balance:string) => {
            expect(balance).toEqual(decBalance)
            expect(response).toBeDefined()
            expect(response).toHaveProperty('result')
            expect(response.result).toEqual(hexBalance)
          }))
      .catch(fail).finally(done))
  })
})
