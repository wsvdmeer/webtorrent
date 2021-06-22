// load dotenv
const dotenv = require('dotenv')
dotenv.config()

// services
const TMDBService = require('./services/tmdbservice')
const IndexerService = require('./services/indexerservice')
const TorrentService = require('./services/torrentservice')
const NetworkService = require('./services/networkservice')

const express = require('express')
const path = require('path')
const app = express()
const router = express.Router()
const port = process.env.PORT // || 4000

const tmdbService = new TMDBService()
const indexerService = new IndexerService()
const torrentService = new TorrentService()
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

const torrents = []

// ROUTES
app.use(express.static('public'))
app.use(express.json())
app.use('/public', express.static(path.resolve(__dirname, 'public', 'static')))

router.get('/', function (_req, res) {
  res.sendFile(path.join(__dirname, 'public/views/search/index.html'))
})

// Player route
router.get('/player', function (_req, res) {
  res.sendFile(path.join(__dirname, 'public/views/player/index.html'))
})

// Torrents route
router.get('/torrents', function (_req, res) {
  res.sendFile(path.join(__dirname, 'public/views/torrents/index.html'))
})

// Search torrents routes
router.get('/searchtorrent*', function (_req, res) {
  console.log('search torrents')
  res.sendFile(path.join(__dirname, 'public/views/searchtorrent/index.html'))
})

// Detail route
router.get('/detail*', function (_req, res) {
  res.sendFile(path.join(__dirname, 'public/views/detail/index.html'))
})

// TMDB
app.get('/api/search/:search', async function async (req, res, next) {
  const data = JSON.parse(req.params.search)
  const result = await tmdbService.search(data.type, data.query)
  res.send(JSON.stringify(result.results))
})

app.get('/api/detail/:query', async function async (req, res, next) {
  console.log('api detail')
  const data = JSON.parse(req.params.query)
  const result = await tmdbService.getDetail(data.type, data.id)
  res.send(JSON.stringify(result))
})

app.get('/api/season/:query', async function async (req, res, next) {
  const data = JSON.parse(req.params.query)
  console.log(data)
  const result = await tmdbService.getSeason(data.id, data.season)
  res.send(JSON.stringify(result))
})

// STREAM
// Set current stream
app.get('/api/setstream/:magnet/:filename', async function (req, res, next) {
  const magnet = req.params.magnet // data.hash
  const filename = req.params.filename // data.file
  currentStream = {
    hash: magnet,
    filename: filename
  }
  console.log(`stream : ${currentStream.hash} ${currentStream.filename}`)
})

// Start stream
app.get('/api/stream/:magnet/:filename', async function (req, res, next) {
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

// Get current stream
app.get('/api/currentstream', function (req, res, next) {
  if (currentStream) {
    if (currentStream.hash && currentStream.filename) {
      res.status(200)
      res.json(currentStream)
    }
  }
})

// TORRENT INDEXER
// Search

app.get('/api/searchindexers/:search', async function (req, res) {
  const results = await indexerService.search(req.params.search)
  console.log('TorrentIndexer')
  console.log(results)
  if (results.length > 0) {
    console.log(`Results : ${results.length}`)
  }
  res.send(JSON.stringify(results))
})

// Torrent info
app.get('/api/gettorrentinfo/:torrent', async function (req, res) {
  const data = JSON.parse(req.params.torrent)
  const index = data.index
  console.log(index)
  const result = await indexerService.getTorrentInfo(torrents[index])
  res.status(200)
  res.json(result)
})

app.post('/api/add', async function (req, res) {
  console.log(req.body)
  const magnet = await indexerService.getMagnet(req.body)
  await torrentService.addTorrent(magnet, (data) => {
    console.log('data', data)
    res.status(data.status)
    res.json(data.videos)
  })
})
app.post('/api/remove', async function (req, res) {
  const magnet = req.body.magnet
  console.log('remove', magnet)
  const result = await torrentService.removeTorrent(magnet)
  res.status(200)
  res.json({ removed: result })
})

app.post('/api/play', async function (req, res, next) {
  const magnet = req.body.magnet
  await torrentService.getTorrentFiles(magnet, (data) => {
    console.log('data', data)

    /* if (data.videos.length > 0) {
      console.log(magnet)
      console.log(data.videos)
      // const hash = data.videos[0].hash // data.hash
      const filename = data.videos[0].filename // data.file
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
    } */
    // res.status(data.status)
    // res.json(data.videos)
  })
})

// TORRENTCLIENT
// Info
app.get('/api/info', async function (req, res, next) {
  const torrentInfo = torrentService.getTorrentsInfo()
  const data = {
    network: networkInfo,
    torrents: torrentInfo
  }
  res.status(200)
  res.json(data)
})

// Add torrent
/*
app.get('/api/add/:torrent', async function (req, res) {
  await torrentService.addTorrent(req.params.torrent, (result) => {
    res.status(result.status)
    res.json(result.json)
  })
})

// Remove torrent
app.get('/api/remove/:torrent', async function (req, res) {
  console.log(`remove : ${req.params.torrents}`)
  const result = await torrentService.removeTorrent(req.params.torrent)
  res.status(200)
  res.json(result)
}) */

// List torrents
app.get('/api/scan', function (_req, res, next) {
  torrentService.checkDirectoryForTorrents()
  res.status(200)
  res.json(torrents)
})

app.get('/api/list', function (_req, res, next) {
  const torrents = torrentService.getTorrents()
  res.status(200)
  res.json(torrents)
})

// Start server
app.use('/', router)
app.listen(port, () => {
  console.log(`Server running on port : ${port}`)
  torrentService.checkDirectoryForTorrents()
})
