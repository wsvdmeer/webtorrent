// const TorrentSearchApi = require('torrent-search-api')
const WebTorrent = require('webtorrent')
const fs = require('fs')
const os = require('os')
const client = new WebTorrent()
client.on('error', function (err) {
  console.error('ERROR: ' + err.message)
})

const directory = `${os.tmpdir()}/webtorrent/`
const fileTypes = ['mp4', '.m4v', '.m4a']
const getVideos = (files) => {
  console.log(files)
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
class TorrentService {
  checkDirectoryForTorrents () {
    console.log('check directory')
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

  getTorrentsInfo () {
    if (client) {
      const data = {
        downloadSpeed: client.downloadSpeed,
        uploadSpeed: client.uploadSpeed,
        progress: client.progress,
        ratio: client.ratio
      }
      return data
    }
    return null
  }

  getTorrent (magnet) {
    client.get(magnet)
  }

  getTorrents () {
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
    return torrent
  }

  async removeTorrent (magnet) {
    console.log('client remove : ' + magnet)
    const torrent = client.get(magnet)
    console.log(torrent)
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
    // }
  }

  async getTorrentFiles (magnet, callback) {
    const files = []
    const torrent = client.get(magnet)
    const result = {
      status: 200,
      videos: []
    }
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
        const videos = getVideos(files)
        result.status = 200
        result.videos = videos
        callback(result)
        return true
      }
    }
  }

  async addTorrent (magnet, callback) {
    console.log('add torrent', magnet)
    const result = {
      status: 200,
      videos: []
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
        const videos = getVideos(files)
        result.status = 200
        result.videos = videos
        callback(result)
        return true
      }
    } else {
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
            result.status = 200
            result.videos = videos
          } else {
            console.log('no videos autoremove', torrent.infoHash)
            result.status = 200
            result.videos = []
          }
          callback(result)
          return true
        }
      })
    }
  }
}
module.exports = TorrentService
