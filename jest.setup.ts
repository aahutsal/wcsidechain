import Ganache from 'ganache-core'

import Axios from 'axios';
const axios = Axios.create()

// Setup logic for jest.
export default async (globalConfig: any) => {
  console.log("Jest Setup...")
  console.log("Starting ganache server...")

  const ganacheOptions:any = {
        port: 8545,
        hostname: 'localhost',
        debug: true,
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
  global.__GServer__ = Ganache.server(ganacheOptions)
  return new Promise((resolve, reject) =>
    global.__GServer__.listen(ganacheOptions.port, err => {
      if(err)
        return reject(err)
      else
        return resolve(global.__GServer__)
    }))
  // attempting to connect
    .then(() => axios.get('http://localhost:8545').catch((err) => err.response.status === 400))
    .then((statusCode) => console.log('Ganache server started,', statusCode))
}
