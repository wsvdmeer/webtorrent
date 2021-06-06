// https://github.com/davidgatti/How-to-Stream-Torrents-using-NodeJS/blob/master/views/index.hjs
// https://github.com/davidgatti/How-to-Stream-Torrents-using-NodeJS/blob/405c8eb93a4a8f7aa83ccba98d4d3bbf08fa2052/routes/video.js
let button
let input
// let result
// let debug
// let torrents
// let files
// let player
let type
// let magnets
let info
// let magnetResults
let results
// let image

const init = () => {
  // debug = document.getElementById('debug')
  type = document.getElementById('type')
  button = document.getElementById('button')
  input = document.getElementById('input')
  results = document.getElementById('results')
  // image = document.getElementById('image')
  // torrents = document.getElementById('torrents')
  // files = document.getElementById('files')
  // magnets = document.getElementById('queue')
  // player = document.getElementById('video')
  info = document.getElementById('info')

  // events
  input.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      search(input.value, type.value)
    }
  })

  button.addEventListener('click', () => {
    search(input.value, type.value)
  })

  getInfo()
  input.value = 'Mortal Kombat'
  search(input.value, type.value)
  // addTorrent(test)
}
/* TODO!
const selectTorrent = (event) => {
  // const link = event.target.getAttribute('url')
  // addTorrent(link)
  const index = event.target.getAttribute('index')
  // console.log(index)
  getTorrentInfo(index)
  // addTorrent(torrent)
}

const showFile = (event) => {
  streamTorrent(event.target.getAttribute('hash'), event.target.getAttribute('file'))
}

// API
// SEARCH
const streamTorrent = (hash, file) => {
  // play here
  // player.setAttribute('src', '/stream/' + hash + '/' + file)

  // send current file to other clients
  const xhr = new XMLHttpRequest()
  xhr.open('GET', '/setstream/' + hash + '/' + file, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.responseText) {
        // console.log(`set : ${this.responseText}`)
      }
    }
  }
  xhr.send()
}

// SELECT
const addTorrent = (url) => {
  files.innerHTML = ''
  // console.log(url)
  const encodedUri = encodeURIComponent(url)
  console.log(encodedUri)
  const query = {
    url: encodedUri
  }
  const xhr = new XMLHttpRequest()
  xhr.open('GET', '/add/' + JSON.stringify(query), true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.responseText) {
        // console.log(xhr.responseText)
        const results = JSON.parse(xhr.responseText)
        // console.log(results)
        results.forEach(item => {
          const li = document.createElement('li')
          li.innerText = `${item.name}'  '${formatBytes(item.length, 0)}`
          li.setAttribute('file', item.name)
          li.setAttribute('hash', item.hash)
          // console.log(item)
          files.appendChild(li)
          li.addEventListener('click', showFile)
        })
        // autoplay first item
        streamTorrent(results[0].hash, results[0].name)
      }
    }
  }
  xhr.send()
} */

const getTitle = (item) => {
  if (item.media_type === 'tv') {
    return item.name
  }
  return item.title
}

const getImage = (item) => {
  if (item.poster_path) {
    return `https://image.tmdb.org/t/p/w500${item.poster_path}`
  }
  return ''
}

const search = async (value, type) => {
  if (value) {
    results.innerHTML = ''
    await fetch('/search/' + JSON.stringify({
      type: type,
      query: value,
      page: 1
    }))
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          data.forEach((item) => {
            console.log(item)
            const name = getTitle(item)
            const li = document.createElement('li')
            const link = document.createElement('a')
            // todo got to /detail
            link.setAttribute('href', `/detail?type=${item.media_type}&query=${name}`)
            link.setAttribute('target', '_self')
            li.appendChild(link)

            const title = document.createElement('div')
            title.innerText = name
            const img = document.createElement('img')

            img.setAttribute('src', getImage(item))
            link.appendChild(img)
            link.appendChild(title)
            results.appendChild(li)
          })
        }
      })
  }
}

/*
// SEARCH TORRENT
const searchTorrents = (search, type) => {
  if (search) {
    torrents.innerHTML = ''
    files.innerHTML = ''

    const query = {
      type: type,
      query: search,
      page: 1
    }
    console.log(`Search torrent ${query.type} ${query.query}`)

    const li = document.createElement('li')
    const title = document.createElement('h2')
    title.innerText = 'Searching...'
    li.appendChild(title)
    torrents.appendChild(li)

    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/searchtorrent/' + JSON.stringify(query), true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onreadystatechange = function () {
      // console.log(xhr.readyState)
      torrents.innerHTML = ''
      if (xhr.readyState === 4) {
        input.disabled = false
        button.disabled = false
        if (xhr.responseText) {
          // console.log(xhr.responseText)
          const results = JSON.parse(xhr.responseText)
          let index = 0
          if (results && results.length > 0) {
            results.forEach(item => {
              // console.log(item)
              const li = document.createElement('li')
              // if (item.link) {
               // li.setAttribute('url', item.link)
              //}
             // if (item.site) {
             //   li.setAttribute('url', item.site)
             // }
              li.setAttribute('index', index)

              // title
              const title = document.createElement('h2')
              // title.innerText = item.fileName
              title.innerText = item.title
              // seeders
              const seeders = document.createElement('span')
              // seeders.innerText = `score ${item.score} seeders ${item.seeders} leechers ${item.leechers}`
              seeders.innerText = `size ${item.size} seeders ${item.seeds} leechers ${item.peers}`
              seeders.classList.add('seeders')
              // fileinfo
              // const file = document.createElement('span')
              // file.innerText = `size ${item.size} codec ${item.codec} resolution ${item.resolution}`
              // file.innerText = `size ${item.size}`
              // file.classList.add('file')

              li.appendChild(title)
              // li.appendChild(file)
              li.appendChild(seeders)

              torrents.appendChild(li)
              li.addEventListener('click', selectTorrent)
              index++
            })
          } else {
            torrents.innerHTML = ''
            const li = document.createElement('li')
            const title = document.createElement('h2')
            title.innerText = 'No results'
            li.appendChild(title)
            torrents.appendChild(li)
          }
        }
      }
    }
    xhr.send()
  }
} */

const getInfo = () => {
  setTimeout(async () => {
    await fetch('/api/info/')
      .then((response) => response.json())
      .then((result) => {
        if (result) {
          info.innerText = `NETWORK [ external ip : ${result.network.externalip} country : ${result.network.country} internal ip ${result.network.internalip} port : ${result.network.port} ]  ACTIVITY [ download : ${result.torrents.downloadSpeed} upload : ${result.torrents.uploadSpeed} ratio :  ${result.torrents.ratio} progress ${result.torrents.progress} ]`
        }
      })
    getInfo()
  }, 1000)
}

/*
const formatBytes = (bytes, decimals) => {
  if (bytes === 0) {
    return '0 Byte'
  }
  const k = 1024
  const dm = decimals + 1 || 3
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
} */

document.addEventListener('DOMContentLoaded', init)
