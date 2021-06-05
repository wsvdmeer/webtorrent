const os = require('os')
const https = require('https')
class NetworkService {
  getNetworkInfo (callback) {
    const options = new URL('https://www.trackip.net/ip?json')
    const ip4 = Object.values(os.networkInterfaces()).flat().find(i => i.family === 'IPv4' && !i.internal).address
    const networkInfo = { externalip: '', country: '', internalip: ip4, port: process.env.PORT }
    const externalIPRequest = https.request(options, res => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        const json = JSON.parse(data)
        console.log(`External ip address : ${json.IP}`)
        console.log(`External ip country : ${json.Country}`)
        networkInfo.externalip = json.IP
        networkInfo.country = json.Country
        callback(networkInfo)
      })
    })
    externalIPRequest.on('error', (error) => {
      console.error(error.message)
      return null
    })
    externalIPRequest.end()
  }
}
module.exports = NetworkService
