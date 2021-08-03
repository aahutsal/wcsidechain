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
    const response: any = await jsonRpc20Processor({ body: fakeRequest })
    expect(response.id).toEqual(9876)
    expect(response.jsonrpc).toEqual("2.0")
    expect(new Date().getTime() - response.result).toBeGreaterThan(0)
    return done()
  })

  it('eth_chainId', async (done) => {
    const fakeRequest = ({
      ...FakeRequest,
      method: "eth_chainId"
    })
    const response: any = await jsonRpc20Processor({ body: fakeRequest })
    expect(response.result).toEqual("0x539")
    return done()
  })

  it('eth_blockNumber', async (done) => {
    const fakeRequest = ({
      ...FakeRequest,
      method: "eth_blockNumber"
    })
    const response: any = await jsonRpc20Processor({ body: fakeRequest })
    expect(response.result).toEqual("0x0")
    return done()
  })

  it('eth_getBlockByNumber', async (done) => {
    const fakeRequest = ({
      ...FakeRequest,
      method: "eth_getBlockByNumber",
      params: ["0x0", false]
    })
    const response: any = await jsonRpc20Processor({ body: fakeRequest })
    expect(response.result).toBeDefined()
    return done()
  })

  it('eth_call', async (done) => {
    const fakeRequest = {
      ...FakeRequest,
      method: "eth_call",
      // Filling eth_call requesting DAI address balance
      params: [{
        to: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        data: "0x70a082310000000000000000000000006c7623eed8fb55de471b3afa2f44afcc2e2946d4"
      }, "0x0"]
    }
    const response: any = await jsonRpc20Processor({ body: fakeRequest })
    expect(response.result).toEqual("0x37fa685259")
    return done()
  })
})
