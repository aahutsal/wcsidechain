"use strict"
import Arweave from 'arweave'
import fs from 'fs'
import bluebird from 'bluebird'

export const readFileAsync = bluebird.promisify(fs.readFile)
export function readJSONFromFileAsync(path) {
  return readFileAsync(path)
    .then((data) => JSON.parse(data.toString()))
}

const arweave = new Arweave({
  host: 'arweave.net',// Hostname or IP address for a Arweave host
  port: 443,          // Port
  protocol: 'https',  // Network protocol http or https
  timeout: 20000,     // Network request timeouts in milliseconds
  logging: false,     // Enable network request logging
})
async function main() {
  let key = await readJSONFromFileAsync('/home/archer/arweave-keyfile-mRJnY8pQhOBfnU3IsTo6M_yIRyA3TlMjkzYrv0SOrhw.json');

  let transaction = await arweave.createTransaction({
    //target: '1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY',
    target: 'Dwvyt0mjqzrwj62vnucavm6cr1qbuijr5ejqdq43i78',
    quantity: '199998436088',
  }, key);

  await arweave.transactions.sign(transaction, key);

  const response = await arweave.transactions.post(transaction);

  console.log(response.status);
}
main()
