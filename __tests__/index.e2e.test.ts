require('dotenv-flow').config()

import { randomBytes } from 'crypto'
import { server, configureServer, jsonRpc20Processor } from '../index'
const { toChecksumAddress, BN } = require("ethereumjs-util");
import logger from '../logger'

const FakeRequest = {
  id: randomBytes(16).toString('hex'),
  jsonrpc: "2.0",
  method: "",
}
let accounts, addresses // global ganache-provided accounts and its addresses

describe('wcsidechain main routines', () => {
  beforeAll(async () => {
    jest.setTimeout(60000)

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
      // logger: { log: logger.log.bind(logger) }
      // allowUnlimitedContractSize: argv.allowUnlimitedContractSize,
      // time: argv.t,
      // keepAliveTimeout: argv.keepAliveTimeout,
      // _chainId: argv.chainId,
      // // gross!
      // _chainIdRpc: argv.chainId
    }

    Promise.resolve(() => {
      // const state: typeof GServer.provider.manager.state = result ? result : GServer.provider.manager.state;

      // accounts = state.accounts;
      // addresses = Object.keys(accounts);
      // var ethInWei = new BN("1000000000000000000");

      // addresses.forEach(function(address, index) {
      //   var balance = new BN(accounts[address].account.balance);
      //   var strBalance = balance.divRound(ethInWei).toString();
      //   var about = balance.mod(ethInWei).isZero() ? "" : "~";
      //   var line = `(${index}) ${toChecksumAddress(address)} (${about}${strBalance} ETH)`;

      //   if (state.isUnlocked(address) == false) {
      //     line += " 🔒";
      //   }

      //   logger.debug(line);
      })
      .then(() => configureServer())
  })

  it('net_version', async () => {
    const fakeRequest = ({
      ...FakeRequest,
      method: "net_version"
    })
    return jsonRpc20Processor({ body: fakeRequest })
      .then((response: any) => {
        expect(response.id).toBeDefined()
        expect(response.id.length).toEqual(32)
        expect(response.jsonrpc).toEqual("2.0")
        expect(new Date().getTime() - response.result).toBeGreaterThan(0)
      })
      .catch(fail)
  })

  it('eth_chainId', async () => {
    const fakeRequest = ({
      ...FakeRequest,
      method: "eth_chainId"
    })
    return jsonRpc20Processor({ body: fakeRequest })
      .then((response: any) => expect(response.result).toEqual("0x540"))
      .catch(fail)
  })

  it('eth_blockNumber', async () => {
    const fakeRequest = ({
      ...FakeRequest,
      method: "eth_blockNumber"
    })
    return jsonRpc20Processor({ body: fakeRequest })
      .then((response: any) => {
        expect(response.result).toBeDefined()
        expect(parseInt(response.result, 16)).toBeDefined()
      })
      .catch(fail)
  })

  it('eth_getBlockByNumber', async () => {
    const fakeRequest = ({
      ...FakeRequest,
      method: "eth_getBlockByNumber",
      params: ["0x0", false]
    })
    return jsonRpc20Processor({ body: fakeRequest })
      .then((response: any) => expect(response.result).toBeDefined())
      .catch(fail)
  })
})
