import { randomBytes } from 'crypto'
import { server, configureServer, getHandlers, jsonRpc20Processor } from '../packages/index'


const FakeRequest = {
    id: randomBytes(16).toString('hex'),
    jsonrpc: "2.0",
    method: "",
}

describe('wcsidechain main routines', () => {
  beforeAll(async (done) => {
    jest.setTimeout(60000)

    return configureServer()
      .then(done)
  })

  afterAll(async () => {
    return server.close()
  })

  it('net_version', async (done) => {
    const fakeRequest = ({
      ...FakeRequest,
      method:"net_version"
    })
    return jsonRpc20Processor({ body: fakeRequest })
      .then((response: any) => {
        expect(response.id).toBeDefined()
        expect(response.id.length).toEqual(32)
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
      .then((response: any) => expect(response.result).toEqual("0x540"))
      .catch(fail).finally(done)
  })

  it('eth_blockNumber', async (done) => {
    const fakeRequest = ({
      ...FakeRequest,
      method: "eth_blockNumber"
    })
    return jsonRpc20Processor({ body: fakeRequest })
      .then((response: any) => {
        expect(response.result).toBeDefined()
        expect(parseInt(response.result, 16)).toBeDefined()
      })
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
})
