import index from '../../index'
import {jsonRpc20Processor} from '../lib/handlers'

describe('wcsidechain/arweave handler', () => {
  const FakeRequest = {
    id: 9876,
    jsonrpc: "2.0",
    method: "",
  }
  beforeAll(async () => {
    jest.setTimeout(60000)
  })

  afterAll(async () => {
    return index.close()
  })

  it('net_version', async (done) => {
    const fakeRequest = ({
      ...FakeRequest,
      method:"net_version"
    })
    return jsonRpc20Processor({ body: fakeRequest })
      .then((response:any) => {
        expect(response.id).toEqual(9876)
        expect(response.jsonrpc).toEqual("2.0")
        expect(new Date().getTime() - response.result).toBeGreaterThan(0)
      })
      .catch(fail).finally(done)
  })

  it('eth_chainId', async (done) => {
    const fakeRequest = ({
      ...FakeRequest,
      method: "eth_chainId"
    })
    return jsonRpc20Processor({ body: fakeRequest })
      .then((response: any) => expect(response.result).toEqual("0x539"))
      .catch(fail).finally(done)
  })

  it('eth_blockNumber', async (done) => {
    const fakeRequest = ({
      ...FakeRequest,
      method: "eth_blockNumber"
    })
    return jsonRpc20Processor({ body: fakeRequest })
      .then((response: any) => expect(response.result).toEqual("0x0"))
      .catch(fail).finally(done)
  })

  it('eth_getBlockByNumber', async (done) => {
    const fakeRequest = ({
      ...FakeRequest,
      method: "eth_getBlockByNumber",
      params: ["0x0", false]
    })
    return jsonRpc20Processor({ body: fakeRequest })
      .then((response:any) => expect(response.result).toBeDefined())
      .catch(fail).finally(done)
  })

  it('eth_call ARWEAVE', async (done) => {
    const fakeRequest = {
      ...FakeRequest,
      method: "eth_call",
      // Filling eth_call requesting DAI address balance
      params: [{
        to: "0xbeed000000000000000000000000000000000001",
        data: "0x70a082310000000000000000000000006c7623eed8fb55de471b3afa2f44afcc2e2946d4"
      }, "0x0"]
    }
    return jsonRpc20Processor({ body: fakeRequest })
      .then(response => {
        console.debug("response:", response)
        return response
      })
      .then((response: any) => {
        expect(response).toBeDefined()
        expect(response).toHaveProperty('result')
        expect(response.result).toEqual("0x37fa685259")
      })
      .catch(fail).finally(done)
  })
  it('eth_call SOLANA', async (done) => {
    const fakeRequest = {
      ...FakeRequest,
      method: "eth_call",
      // Filling eth_call requesting DAI address balance
      params: [{
        to: "0xbeed000000000000000000000000000000000002",
        data: "0x70a082310000000000000000000000006c7623eed8fb55de471b3afa2f44afcc2e2946d4"
      }, "0x0"]
    }
    return jsonRpc20Processor({ body: fakeRequest })
      .then(response => {
        console.debug("response:", response)
        return response
      })
      .then((response: any) => {
        expect(response).toBeDefined()
        expect(response).toHaveProperty('result')
        expect(response.result).toEqual("0x82e64eeb4")
      })
      .catch(fail).finally(done)
  })

})
