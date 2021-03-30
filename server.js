// load dotenv
const dotenv = require('dotenv')
dotenv.config()

// services
const OMDBService = require('./services/omdbservice')
// const SearchService = require('./services/searchservice')
const IndexerService = require('./services/indexerservice')
const TorrentService = require('./services/torrentservice')
const NetworkService = require('./services/networkservice')

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const app = express()
const router = express.Router()
const port = process.env.PORT // || 4000

const omdbService = new OMDBService()
// const searchService = new SearchService()
const indexerService = new IndexerService()
const torrentService = new TorrentService(indexerService)
const networkService = new NetworkService()

// variables
let networkInfo
networkService.getNetworkInfo((result) => {
  networkInfo = result
})
let currentStream = {
  hash: '',
  filename: ''
}

let torrents = []

// Index route
app.use(express.static('public'))
app.use(bodyParser.json())
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

// Player route
router.get('/player', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/player.html'))
})

// Torrents route
router.get('/torrents', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/torrents.html'))
})

// ACTIONS
// Imdb search
app.get('/search/:search', async function async (req, res, next) {
  const result = await omdbService.search(req.params.search)
  console.log(result)
  res.send(JSON.stringify(result))
})
// Torrent search
app.get('/searchtorrent/:search', async function (req, res) {
  const results = await indexerService.search(req.params.search)
  torrents = results
  console.log('TorrentIndexer')
  console.log(results)
  if (results.length > 0) {
    console.log(`Results : ${results.length}`)
  }
  res.send(JSON.stringify(results))
})
// Set stream
app.get('/setstream/:magnet/:filename', async function (req, res, next) {
  const magnet = req.params.magnet // data.hash
  const filename = req.params.filename // data.file
  currentStream = {
    hash: magnet,
    filename: filename
  }
  console.log(`stream : ${currentStream.hash} ${currentStream.filename}`)
})
// Stream
app.get('/stream/:magnet/:filename', async function (req, res, next) {
  const magnet = req.params.magnet // data.hash
  const filename = req.params.filename // data.file
  const torrent = torrentService.getTorrent(magnet)// client.get(magnet)
  let file = {}
  if (!torrent) {
    const err = new Error('Torrent null')
    err.status = 405
    next(err)
  }
  torrent.files.forEach((torrent) => {
    if (torrent.name === filename) {
      file = torrent
    }
  })

  const range = req.headers.range
  if (!range) {
    const err = new Error('Wrong range')
    err.status = 416
    next(err)
  }
  const positions = range.replace(/bytes=/, '').split('-')
  const start = parseInt(positions[0], 10)
  const fileSize = file.length
  const end = positions[1] ? parseInt(positions[1], 10) : fileSize - 1
  const chunksize = end - start + 1
  const head = {
    'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': 'video/mp4'
  }
  res.writeHead(206, head)
  const streamPosition = {
    start: start,
    end: end
  }
  const stream = file.createReadStream(streamPosition)
  stream.pipe(res)
  stream.on('error', function (err) {
    next(err)
  })
})
// Current stream
app.get('/currentstream', function (req, res, next) {
  if (currentStream) {
    if (currentStream.hash && currentStream.filename) {
      res.status(200)
      res.json(currentStream)
    }
  }
})
// Torrents info
app.get('/info', async function (req, res, next) {
  const torrentInfo = torrentService.getTorrentsInfo()
  const data = {
    network: networkInfo,
    torrents: torrentInfo
  }
  res.status(200)
  res.json(data)
})
// Remove torrent
app.get('/remove/:torrent', async function (req, res) {
  console.log(`remove : ${req.params.torrents}`)
  const result = await torrentService.removeTorrent(req.params.torrent)
  res.status(200)
  res.json(result)
})
// Add torrent
app.get('/add/:torrent', async function (req, res) {
  await torrentService.addTorrent(req.params.torrent, (result) => {
    res.status(result.status)
    res.json(result.json)
  })
})
// Torrent info
app.get('/gettorrentinfo/:torrent', async function (req, res) {
  const data = JSON.parse(req.params.torrent)
  const index = data.index
  console.log(index)

  const result = await indexerService.getTorrentInfo(torrents[index])
  res.status(200)
  res.json(result)
})
// List torrents
app.get('/list', function (req, res, next) {
  const torrents = torrentService.getTorrents()
  res.status(200)
  res.json(torrents)
})

// Start server
app.use('/', router)
app.listen(port, () => {
  console.log(`Server running on port : ${port}`)
})
