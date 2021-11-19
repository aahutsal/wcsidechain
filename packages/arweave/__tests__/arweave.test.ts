require('dotenv-flow').config()
import Arweave from 'arweave'
import { ar , init, registerWallet, getWalletsRegistered, balanceOf, transfer } from '../lib/handlers'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import logger from '../../../logger'
// import Arweave from 'arweave';
import TestWeave from 'testweave-sdk';

describe('wcsidechain/arweave handler', () => {
  let contractAddress:string 
  let testWeave:TestWeave
  beforeAll(async () => {
    jest.setTimeout(5000) // allowing 5 seconds for test to complete
    contractAddress = await init({
      host: 'arweave.net',
      port: 80,
      protocol: 'http',
      timeout: 20000,
      logging: false
    })
    //testWeave = await TestWeave.init(ar);
  })

  it('testing `init` call', () => {
    expect(Object.keys(getWalletsRegistered()).length).toEqual(2)
    expect(contractAddress).toEqual("0xbeed000000000000000000000000000000000001")
  })

  test('testing balanceOf axios call', async ():Promise<void> => {
    logger.debug('balanceOf (contract address', contractAddress, ')')

    const ethAddress = Object.keys(getWalletsRegistered())[0]
    const walletAddress: string = getWalletsRegistered()[ethAddress].address
    const mock = new MockAdapter(ar.api.request());
     const successCB = jest.fn();
     const success = 'success'

    mock.onGet(`wallet/${walletAddress}/balance`).reply(200, 'success');
    const axiosSpy = jest.spyOn(ar.api.request(), 'get');

    axiosSpy.mockResolvedValue({success})
    await balanceOf(ethAddress) // firing axios call

    expect(axiosSpy).toHaveBeenCalledWith(`wallet/${walletAddress}/balance`);  // Success!
    //expect(successCB.mock.calls).toBe(success);  // Success!
  })
})
