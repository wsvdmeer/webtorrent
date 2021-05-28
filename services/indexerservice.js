const TorrentSearchApi = require('torrent-search-api')
TorrentSearchApi.enablePublicProviders()
class IndexerService {
  async search (json) {
    const data = JSON.parse(json)
    const query = data.query + ' x264 webrip'
    const type = data.type
    console.log(`Searching for : ${query} ${type}`)
    const searchResults = await TorrentSearchApi.search(query, type, 20)
    return searchResults
  }

  async getTorrentInfo (torrent) {
    return await TorrentSearchApi.getTorrentDetails(torrent)
  }

  async getMagnet (url) {
    const magnet = await TorrentSearchApi.getMagnet(url)
    return magnet
  }
}
module.exports = IndexerService
