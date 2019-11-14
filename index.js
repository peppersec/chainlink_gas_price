require('dotenv').config()
const fetch = require('node-fetch')
const { Client } = require('pg');
const { toWei } = require('web3-utils');

const connectionString = process.env.DATABASE_URL_GASPRICE
const INTERVAL = process.env.INTERVAL

let gasPrices = {
  standard: 0,
  fast: 0
}
const smartContractPollTime = 5  // in seconds
const gasOracleUrls = [
  'https://gasprice.poa.network/',
  'https://www.etherchain.org/api/gasPriceOracle'
]

function fetchGasPrice() {
  let oracleIndex = 0
  const getPrices = async (resolve, reject) => {
    try {
      const response = await fetch(gasOracleUrls[oracleIndex % gasOracleUrls.length])
      if (response.status === 200) {
        const json = await response.json()

        if (json.standard) {
          gasPrices.standard = Number(json.standard)
        }
        if (json.fast) {
          gasPrices.fast = Number(json.fast)
        }
      } else {
        throw Error('Fetch gasPrice failed')
      }

      if (gasPrices.standard === 0 || gasPrices.fast === 0) {
        throw Error('Invalid data returned')
      }
      resolve(gasPrices)
    } catch (e) {
      console.error(e)
      oracleIndex++
      setTimeout(() => getPrices(resolve, reject), 1000 * smartContractPollTime)
    }
  }
  return new Promise(getPrices)

}

async function main() {
  let client
  try {
    client = new Client({
      connectionString: connectionString,
    })
    client.connect()
    const prices = await fetchGasPrice();
    const add = prices.fast
    const fast = toWei(add.toString(), 'gwei')
    console.log('fast gas price is', fast , 'gwei')
    const querytext = 'UPDATE configurations SET value = $1 WHERE name = $2'
    await client.query(querytext, [fast, 'ETH_GAS_PRICE_DEFAULT'])
  } catch (e) {
    console.error(e)
    process.exit(e.message)
  } finally {
    client.end()
  }
  setTimeout(main, INTERVAL || 15000)
}
main()

