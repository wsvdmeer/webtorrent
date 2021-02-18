const WebTorrent = require('webtorrent')
const fs = require('fs')
const os = require('os')
const client = new WebTorrent()
let indexerService
const directory = `${os.tmpdir()}/webtorrent/`
const fileTypes = ['mp4', '.m4v', '.m4a']

/*
function getVideos (files) {
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

/*
async function removeTorrent (torrentJson) {
  const data = JSON.parse(torrentJson)
  const url = data.url
  let magnet = url
  if (url) {
    if (url.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i) === null) {
      magnet = await indexerService.getMagnet(url)
      console.log(`converted from link : ${magnet}`)
    }
    console.log('client remove : ' + magnet)
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

class TorrentService {
  constructor (indexerService) {
    this.indexerService = indexerService
    client.on('error', function (err) {
      console.error('ERROR: ' + err.message)
    })
  }

  getVideos (files) {
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

  checkDirectoryForTorrents () {
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
    this.checkDirectoryForTorrents()
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

  async removeTorrent (json) {
    console.log(`public remove : ${json}`)
    const data = JSON.parse(json)
    const url = data.url
    let magnet = url
    if (url) {
      if (url.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i) === null) {
        magnet = await indexerService.getMagnet(url)
        console.log(`converted from link : ${magnet}`)
      }
      console.log('client remove : ' + magnet)
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

  async addTorrent (json, callback) {
    const data = JSON.parse(json)
    const url = data.url
    const result = {
      status: 200,
      videos: []
    }
    let magnet = url
    if (url) {
      if (url.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i) === null) {
        // no a magnet link
        magnet = await indexerService.getMagnet(url)
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
          const videos = this.getVideos(files)
          result.status = 200
          result.videos = videos
          callback(result)
        }
      } else {
        console.log(`Add ${json}`)
        client.add(magnet, async function (torrent) {
          torrent.files.forEach(function (file) {
            files.push({
              hash: torrent.infoHash,
              name: file.name,
              length: file.length
            })
          })
          if (files) {
            const videos = this.getVideos(files)
            if (videos.length > 0) {
              result.status = 200
              result.json = videos
              callback(result)
            } else {
              const remove = await this.removeTorrent(torrent.infoHash)
              console.log('auto remove : ' + remove)
            }
          }
        })
      }
    }
  }
}
module.exports = TorrentService
