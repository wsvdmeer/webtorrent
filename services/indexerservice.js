const TorrentIndexer = require('torrent-indexer')
const torrentIndexer = new TorrentIndexer()
class IndexerService {
  async search (json) {
    const data = JSON.parse(json)
    const query = data.query + ' x264 webrip'
    const type = data.type
    console.log(query)

    console.log(`Searching for : ${query} ${type}`)
    const searchResults = await torrentIndexer.search(query, type, 1)
    return searchResults
  }

  async getMagnet (url) {
    const magnet = await torrentIndexer.torrent(url)
    return magnet
  }
}
module.exports = IndexerService
