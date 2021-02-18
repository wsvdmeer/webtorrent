// services
const SearchService = require('./services/searchservice')
const IndexerService = require('./services/indexerservice')
const TorrentService = require('./services/torrentservice')
const NetworkService = require('./services/networkservice')

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
// const WebTorrent = require('webtorrent')

// const os = require('os')
// const fs = require('fs')
// const https = require('https')

// const client = new WebTorrent()
// const directory = `${os.tmpdir()}/webtorrent/`
const app = express()
const router = express.Router()
const port = process.env.PORT || 4000
// const fileTypes = ['mp4', '.m4v', '.m4a']
let currentStream = {
  hash: '',
  filename: ''
}

// IP
// const options = new URL('https://ifconfig.me/all.json')
/* const options = new URL('https://www.trackip.net/ip?json')
const ip4 = Object.values(os.networkInterfaces()).flat().find(i => i.family === 'IPv4' && !i.internal).address
const networkInfo = { externalip: '', country: '', internalip: ip4, port: port }
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
  })
})
externalIPRequest.on('error', (error) => { console.error(error.message) })
externalIPRequest.end() */

const searchService = new SearchService()
const indexerService = new IndexerService()
const torrentService = new TorrentService(indexerService)
const networkService = new NetworkService()
let networkInfo
networkService.getNetworkInfo((result) => {
  networkInfo = result
})
// INDEX
app.use(express.static('public'))
app.use(bodyParser.json())
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

// PLAYER
router.get('/player', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/player.html'))
})

// TORRENTS
router.get('/torrents', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/torrents.html'))
})

// CLIENT
/* client.on('error', function (err) {
  console.error('ERROR: ' + err.message)
}) */

// SEARCH
app.get('/search/:search', async function (req, res, next) {
  await searchService.search(req.params.search, (result) => {
    res.send(JSON.stringify(result))
    // if (result.status === 200) {
    // } else {
    // next(result.message)
    // }
  })
})

app.get('/searchtorrent/:search', async function (req, res) {
  const results = await indexerService.search(req.params.search)
  console.log('TorrentIndexer')
  console.log(results)
  if (results.length > 0) {
    console.log(`Results : ${results.length}`)
  }
  res.send(JSON.stringify(results))
})

/*
const getVideos = (files) => {
  const videos = []
  if (files && files.length > 0) {
    files.forEach((file) => {
      console.log(file)
      fileTypes.forEach((item) => {
        if (file.name.endsWith(item)) {
          videos.push(file)
        }
      })
    })
    console.log('autoplay : ' + videos)
  }
  return videos
} */

/* const removeTorrent = async (url) => {
  let magnet = url
  if (url) {
    if (url.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i) === null) {
      magnet = await indexerService.getMagnet(url)// await torrentIndexer.torrent(url)
      console.log(`converted from link : ${magnet}`)
    }
    console.log('client remove : ' + magnet)
    // client.remove(id)
    const torrent = client.get(magnet)
    const path = torrent.path

    client.remove(magnet, function (error) {
      if (!error) {
        try {
          fs.rmdirSync(path, { recursive: true })
          console.log(`${path} is deleted!`)
          return true
        } catch (err) {
          console.error(`Error while deleting ${path}.`)
          return false
        }
      } else {
        return false
      }
    })
  }
} */

// REMOVE
app.get('/remove/:torrent', async function (req, res) {
  const result = await torrentService.removeTorrent(req.param.torrent)
  res.status(200)
  res.json(result)
})

// SELECT
app.get('/add/:torrent', async function (req, res) {
  await torrentService.addTorrent(req.params.torrent, (result) => {
    res.status(result.status)
    res.json(result.json)
  })
  /*
  const data = JSON.parse(req.params.torrent)
  const url = data.url
  let magnet = url
  if (url) {
    if (url.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i) === null) {
      // no a magnet link
      magnet = await indexerService.getMagnet(url)
      // magnet = await TorrentSearchApi.getMagnet(url)
      console.log(`converted from link : ${magnet}`)
    }

    // check if exsists
    const files = []
    const torrent = client.get(magnet)
    if (torrent) {
      console.log(`Get : ${magnet}`)
      torrent.files.forEach(function (file) {
        files.push({
          hash: torrent.infoHash,
          name: file.name,
          length: file.length
        })
      })
      if (files) {
        res.status(200)
        res.json(getVideos(files))
      }
    } else {
      console.log(`Add ${req.params.torrent}`)
      client.add(magnet, async function (torrent) {
        torrent.files.forEach(function (file) {
          files.push({
            hash: torrent.infoHash,
            name: file.name,
            length: file.length
          })
        })
        if (files) {
          const videos = getVideos(files)
          if (videos.length > 0) {
            res.status(200)
            res.json(getVideos(files))
          } else {
            const remove = await removeTorrent(torrent.infoHash)
            console.log('auto remove : ' + remove)
          }
        }
      })
    }
  } */
})

app.get('/setstream/:magnet/:filename', async function (req, res, next) {
  const magnet = req.params.magnet // data.hash
  const filename = req.params.filename // data.file
  currentStream = {
    hash: magnet,
    filename: filename
  }
  console.log(`stream : ${currentStream.hash} ${currentStream.filename}`)
})

// STREAM
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

// INFO
app.get('/currentstream', function (req, res, next) {
  if (currentStream) {
    if (currentStream.hash && currentStream.filename) {
      res.status(200)
      res.json(currentStream)
    }
  }
})
app.get('/info', async function (req, res, next) {
  const torrentInfo = torrentService.getTorrentsInfo()

  const data = {
    network: networkInfo,
    torrents: torrentInfo
  }

  res.status(200)
  res.json(data)

  /* if (client) {
    const data = {
      downloadSpeed: client.downloadSpeed,
      uploadSpeed: client.uploadSpeed,
      progress: client.progress,
      ratio: client.ratio,
      network: networkInfo
    }
    res.status(200)
    res.json(data)
  } */
})

/*
const checkDirectoryForTorrents = () => {
  if (fs.existsSync(directory)) {
    fs.readdir(directory, (err, files) => {
      if (!err) {
        files.forEach(file => {
          const dirTorrent = client.get(file)
          if (!dirTorrent) {
            client.add(file, function (torrent) {
              console.log('resume ' + torrent)
            })
          }
        })
      } else {
        console.log(err)
      }
    })
  }
} */

// LIST
app.get('/list', function (req, res, next) {
  /* checkDirectoryForTorrents()
  const torrent = client.torrents.reduce(function (array, data) {
    array.push({
      infoHash: data.infoHash,
      name: data.name,
      magnetUri: data.magnetURI,
      timeRemaining: data.timeRemaining,
      downloaded: data.downloaded,
      uploaded: data.uploaded,
      downloadSpeed: data.downloadSpeed,
      uploadSpeed: data.uploadSpeed,
      progress: data.progress,
      ratio: data.ratio,
      maxWebConns: data.maxWebConns,
      path: data.path,
      ready: data.ready,
      done: data.done
    })

    return array
  }, []) */
  const torrents = torrentService.getTorrents()
  res.status(200)
  res.json(torrents)
})

app.use('/', router)
app.listen(port, () => {
  console.log(`Server running on port : ${port}`)
})
