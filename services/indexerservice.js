const TorrentSearchApi = require('torrent-search-api')
TorrentSearchApi.enablePublicProviders()
TorrentSearchApi.disableProvider('Torrent9')
class IndexerService {
  async search (json) {
    const data = JSON.parse(json)
    const query = data.query + ' x264 webrip'
    const type = data.type
    console.log(`Searching for : ${query} ${type}`)
    const searchResults = await TorrentSearchApi.search(query, type, 100)
    return searchResults
  }

  // get html info
  async getTorrentInfo (torrent) {
    return await TorrentSearchApi.getTorrentDetails(torrent)
  }

  // get magnet
  async getMagnet (url) {
    const magnet = await TorrentSearchApi.getMagnet(url)
    return magnet
  }
}
module.exports = IndexerService
