import fs from 'fs'
import { promisify } from 'bluebird'

export const readFileAsync = promisify(fs.readFile)
export async function readJSONFromFileAsync(path: string): Promise<any> {
  return readFileAsync(path).then((data: Buffer) => JSON.parse(data.toString()))
}
