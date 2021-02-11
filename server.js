const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const WebTorrent = require('webtorrent')
const TorrentIndexer = require('torrent-indexer')
const os = require('os')
const fs = require('fs')

/* const TorrentSearchApi = require('torrent-search-api')
TorrentSearchApi.enableProvider('ThePirateBay')
TorrentSearchApi.enableProvider('1337x')
TorrentSearchApi.enableProvider('Torrentz2')
TorrentSearchApi.enableProvider('KickassTorrents')
TorrentSearchApi.enableProvider('Rarbg')
TorrentSearchApi.enableProvider('Yts')
TorrentSearchApi.enableProvider('Eztv') */

// IP

const ip = Object.values(os.networkInterfaces()).flat().find(i => i.family === 'IPv4' && !i.internal).address

const client = new WebTorrent()
const directory = `${os.tmpdir()}/webtorrent/`
const app = express()
const router = express.Router()
const torrentIndexer = new TorrentIndexer()
const port = process.env.PORT || 4000
const fileTypes = ['mp4', '.m4v', '.m4a']
let currentStream = {
  hash: '',
  filename: ''
}

// IMDB
const imdb = require('imdb-api')
const omdbApiKey = 'e21a3e3d'
const imdbClient = new imdb.Client({ apiKey: omdbApiKey })

app.use(express.static('public'))
app.use(bodyParser.json())
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

router.get('/player', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/player.html'))
})

router.get('/torrents', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/torrents.html'))
})

// CLIENT
client.on('error', function (err) {
  console.error('ERROR: ' + err.message)
})

// FIND

// SEARCH
app.get('/search/:search', function (req, res, next) {
  const data = JSON.parse(req.params.search)

  const result = {
    title: '',
    poster: '',
    results: [],
    type: '',
    year: ''
  }

  imdbClient.get({ name: data.query }).then((search) => {
    result.poster = search.poster
    result.title = search.name
    result.year = search.year
    switch (search.constructor.name) {
      case 'Movie':
        result.type = 'movie'
        break
      case 'TVShow':
        result.type = 'tv'
        return search.episodes()
    }
  }).then((eps) => {
    if (eps) {
      const episodes = []
      eps.forEach((item) => {
        if (item.poster === undefined) {
          item.poster = result.poster
        }
        episodes.push(item)
      })
      result.results = episodes
    }
    console.log(result)
    res.send(JSON.stringify(result))
  }).catch((error) => {
    next(error)
  })
})

app.get('/searchtorrent/:search', async function (req, res) {
  const data = JSON.parse(req.params.search)
  const query = data.query + ' x264 webrip'
  console.log(query)

  // const torrents = await TorrentSearchApi.search(query, data.type, 20)
  // console.log('TorrentSearchApi')
  // console.log(torrents)

  const results = await search(query, data.type)
  console.log('TorrentIndexer')
  console.log(results)
  if (results.length > 0) {
    console.log(`Results : ${results.length}`)
  }
  res.send(JSON.stringify(results))
})

const search = async (query, type) => {
  console.log(`Searching for : ${query} ${type}`)
  const searchResults = await torrentIndexer.search(query, type, 1)
  return searchResults
}

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
}

const removeTorrent = async (url) => {
  let magnet = url
  if (url) {
    if (url.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i) === null) {
      magnet = await torrentIndexer.torrent(url)
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
}

// REMOVE
app.get('/remove/:torrent', async function (req, res) {
  const data = JSON.parse(req.params.torrent)
  const url = data.url
  const result = await removeTorrent(url)
  res.status(200)
  res.json(result)
})

// SELECT
app.get('/add/:torrent', async function (req, res) {
  const data = JSON.parse(req.params.torrent)
  const url = data.url
  let magnet = url
  if (url) {
    if (url.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i) === null) {
      // no a magnet link
      magnet = await torrentIndexer.torrent(url)
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
  }
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
  const torrent = client.get(magnet)
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
  if (client) {
    const data = {
      downloadSpeed: client.downloadSpeed,
      uploadSpeed: client.uploadSpeed,
      progress: client.progress,
      ratio: client.ratio
    }
    res.status(200)
    res.json(data)
  }
})

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
}

// LIST
app.get('/list', function (req, res, next) {
  checkDirectoryForTorrents()
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
  }, [])
  res.status(200)
  res.json(torrent)
})

app.use('/', router)
app.listen(port, () => {
  console.log(`Server running on :${port}`)
  console.log(`outgoing ip address : ${ip}`)
})
