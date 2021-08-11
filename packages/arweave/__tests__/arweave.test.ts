import { randomBytes } from 'crypto'
import {server, configureServer, getHandlers, jsonRpc20Processor} from '../../index'
import TestWeave from 'testweave-sdk';

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

describe('wcsidechain/arweave handler', () => {
  beforeAll(async (done) => {
    jest.setTimeout(60000)

    return configureServer()
      .then(done)
  })

  afterAll(async () => {
    return server.close()
  })

  it('eth_sendRawTransaction', async (done) => {
    const fakeRequest = ({
      ...FakeRequest,
      method: "eth_sendRawTransaction",
      // nonce == 0 here
      params: ["0xf8a68080827d2294beed00000000000000000000000000000000000180b844a9059cbb000000000000000000000000beed0000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000820a95a0491938312b37e2aad5b9b6ecb4a57f2c42a22493936c9f532fcf2b3eddecfe93a067a5036d389ecbdfa8ed17d6fbd18d65da8443f534d665307d9b7ab05757a27f"]

    })
    return jsonRpc20Processor({ body: fakeRequest })
      .then((response:any) => {
        expect(response.error).toBeUndefined()
        expect(response).toHaveProperty('result')
        expect(response.result).toBeDefined()
        return response
      })
      .catch(fail).finally(done)
  })

  it('eth_call ARWEAVE balanceOf', async (done) => {
    return jsonRpc20Processor({
      body: {
        id: '0x' + randomBytes(16).toString('hex'),
        method: 'eth_getTransactionCount',
        params: ["0xbeed000000000000000000000000000000000001",'latest']
      }
    })
      .then((response:any) =>
        jsonRpc20Processor({
          body: {
            ...FakeRequest,
            method: "eth_call",
            // Filling eth_call requesting `AR` address balance
            params: [{
              to: "0xbeed000000000000000000000000000000000001",
              data: "0x70a08231000000000000000000000000d2236a1ccd4ced06e16eb1585c8c474969a6ccfe"
            }, response.value]
          } }))
      .then(response => {
        console.debug("response:", response)
        return response
      })
      .then((response: any) => {
        expect(response).toBeDefined()
        expect(response).toHaveProperty('result')
        expect(parseInt(response.result, 16)).toBeGreaterThan(0)
      })
      .catch(fail).finally(done)
  })
  // it('eth_call SOLANA', async (done) => {
  //   const fakeRequest = {
  //     ...FakeRequest,
  //     method: "eth_call",
  //     // Filling eth_call requesting DAI address balance
  //     params: [{ to: "0xbeed000000000000000000000000000000000002", data: "0x70a082310000000000000000000000006c7623eed8fb55de471b3afa2f44afcc2e2946d4"  }, "0x0"]
  //   }
  //   return jsonRpc20Processor({ body: fakeRequest })
  //     .then(response => {
  //       console.debug("response:", response)
  //       return response
  //     })
  //     .then((response: any) => {
  //       expect(response).toBeDefined()
  //       expect(response).toHaveProperty('result')
  //       expect(response.result).toBeDefined()
  //     })
  //     .catch(fail).finally(done)
  // })

})
