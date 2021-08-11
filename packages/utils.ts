import fs from 'fs'
import { promisify } from 'bluebird'

export const readFileAsync = promisify(fs.readFile)
export function readJSONFromFileAsync(path: string): any {
  return readFileAsync(path)
    .then((data: Buffer) => JSON.parse(data.toString()))
}
