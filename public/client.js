// https://github.com/davidgatti/How-to-Stream-Torrents-using-NodeJS/blob/master/views/index.hjs
// https://github.com/davidgatti/How-to-Stream-Torrents-using-NodeJS/blob/405c8eb93a4a8f7aa83ccba98d4d3bbf08fa2052/routes/video.js
let button
let input
let debug
let torrents
let files
let player
let type
// let magnets
let info
// let magnetResults
let searchResults

const init = () => {
  debug = document.getElementById('debug')
  type = document.getElementById('type')
  button = document.getElementById('button')
  input = document.getElementById('input')
  searchResults = document.getElementById('searchresults')
  torrents = document.getElementById('torrents')
  files = document.getElementById('files')
  // magnets = document.getElementById('queue')
  player = document.getElementById('video')
  info = document.getElementById('info')

  // events
  input.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      search(input.value)
    }
  })

  button.addEventListener('click', () => {
    search(input.value)
  })

  // listFiles()
  clientData()

  // addTorrent(test)
}

const selectTorrent = (event) => {
  const link = event.target.getAttribute('url')
  addTorrent(link)
}

const showFile = (event) => {
  streamTorrent(event.target.getAttribute('hash'), event.target.getAttribute('file'))
}

// API
// SEARCH
const streamTorrent = (hash, file) => {
  // play here
  player.setAttribute('src', '/stream/' + hash + '/' + file)

  // send current file to other clients
  const xhr = new XMLHttpRequest()
  xhr.open('GET', '/setstream/' + hash + '/' + file, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.responseText) {
        console.log(`set : ${this.responseText}`)
      }
    }
  }
  xhr.send()
}

// SELECT
const addTorrent = (url) => {
  files.innerHTML = ''
  console.log(url)
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
        console.log(xhr.responseText)
        const results = JSON.parse(xhr.responseText)
        console.log(results)
        results.forEach(item => {
          const li = document.createElement('li')
          li.innerText = `${item.name}'  '${formatBytes(item.length, 0)}`
          li.setAttribute('file', item.name)
          li.setAttribute('hash', item.hash)
          console.log(item)
          files.appendChild(li)
          li.addEventListener('click', showFile)
        })
        // autoplay first item
        streamTorrent(results[0].hash, results[0].name)
      }
    }
  }
  xhr.send()
}
const search = (value) => {
  if (value) {
    button.disabled = true
    input.disabled = true
    searchResults.innerHTML = ''
    const query = {
      type: type.value,
      query: input.value,
      page: 1
    }
    log('Search imdb' + input.value)
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/search/' + JSON.stringify(query), true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        input.disabled = false
        button.disabled = false
        if (xhr.responseText) {
          const result = JSON.parse(xhr.responseText)
          if (result.type === 'tv') {
            result.results.forEach(episode => {
              const li = document.createElement('li', { is: 'search-item' })
              const img = document.createElement('img')
              img.src = episode.poster

              const content = document.createElement('div')
              content.classList.add('content')
              const title = document.createElement('h2')
              title.innerText = episode.title

              const info = document.createElement('span')

              li.appendChild(img)
              li.appendChild(content)
              content.appendChild(title)
              content.appendChild(info)

              // create query
              let s = `s${episode.season.toString()}`
              if (episode.season < 10) {
                s = `s0${episode.season}`
              }

              let e = `e${episode.episode.toString()}`
              if (episode.episode < 10) {
                e = `e0${episode.episode}`
              }

              info.innerText = `Season ${s} Episode ${e}`

              const query = `${result.title} ${s}${e}`

              li.setAttribute('query', query)
              li.setAttribute('type', result.type)
              searchResults.appendChild(li)
              li.addEventListener('click', searchTorrent)
            })
          } else {
            // movie
            const li = document.createElement('li')
            const img = document.createElement('img')
            img.src = result.poster

            const title = document.createElement('h2')
            title.innerText = result.title

            const info = document.createElement('span')
            info.innerText = result.year

            li.appendChild(img)
            li.appendChild(title)
            li.appendChild(info)

            const query = `${result.title} ${result.year}`
            li.setAttribute('query', query)
            li.setAttribute('type', result.type)
            searchResults.appendChild(li)
            li.addEventListener('click', searchTorrent)
          }
        }
      }
    }
    xhr.send()
  }
}
const searchTorrent = (event) => {
  console.log(`Search for torrent ${event.target.getAttribute('query')} ${event.target.getAttribute('type')}`)
  searchTorrents(event.target.getAttribute('query'), event.target.getAttribute('type'))
}
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
    log(`Search torrent ${query.type} ${query.query}`)

    const li = document.createElement('li')
    const title = document.createElement('h2')
    title.innerText = 'Searching...'
    li.appendChild(title)
    torrents.appendChild(li)

    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/searchtorrent/' + JSON.stringify(query), true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onreadystatechange = function () {
      console.log(xhr.readyState)
      torrents.innerHTML = ''
      if (xhr.readyState === 4) {
        input.disabled = false
        button.disabled = false
        if (xhr.responseText) {
          console.log(xhr.responseText)
          const results = JSON.parse(xhr.responseText)
          if (results && results.length > 0) {
            results.forEach(item => {
              console.log(item)
              const li = document.createElement('li')
              if (item.link) {
                li.setAttribute('url', item.link)
              }
              if (item.site) {
                li.setAttribute('url', item.site)
              }

              // title
              const title = document.createElement('h2')
              title.innerText = item.fileName

              // seeders
              const seeders = document.createElement('span')
              seeders.innerText = `score ${item.score} seeders ${item.seeders} leechers ${item.leechers}`
              seeders.classList.add('seeders')
              // fileinfo
              const file = document.createElement('span')
              file.innerText = `size ${item.size} codec ${item.codec} resolution ${item.resolution}`
              file.classList.add('file')

              li.appendChild(title)
              li.appendChild(file)
              li.appendChild(seeders)

              torrents.appendChild(li)
              li.addEventListener('click', selectTorrent)
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
}

const clientData = () => {
  setTimeout(function () {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/info/', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.responseText) {
          console.log(this.responseText)
          const result = JSON.parse(xhr.responseText)
          info.innerText = `d ${result.downloadSpeed} u ${result.uploadSpeed} r ${result.ratio} p ${result.progress}`
        }
        clientData()
      }
    }
    xhr.send()
  }, 1000)
}

/*
const listFiles = () => {
  setTimeout(function () {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/list/', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.responseText) {
          const results = JSON.parse(xhr.responseText)
          if (results.length > 0) {
            if (JSON.stringify(results) !== JSON.stringify(magnetResults)) {
              magnetResults = results
              console.log('different')
              console.log(results)
              magnets.innerHTML = ''
              magnetResults.forEach(item => {
                const li = document.createElement('li')

                const title = document.createElement('h2')
                title.innerText = item.name
                li.appendChild(title)

                const infoList = document.createElement('span')
                li.appendChild(infoList)

                const remove = document.createElement('button')
                remove.innerText = 'Remove'
                li.appendChild(remove)
                remove.setAttribute('url', item.magnetUri)
                remove.addEventListener('click', removeTorrent)

                const play = document.createElement('button')
                play.innerText = 'Play'
                li.appendChild(play)
                play.setAttribute('url', item.magnetUri)
                play.addEventListener('click', selectTorrent)

                let infoText = ''

                for (const [key, value] of Object.entries(item)) {
                  infoText += `${key} : ${value}\n`
                }
                infoList.innerText = infoText

                // li.innerText = item.name + '/' + item.infoHash + '/' + item.path
                //
                // li.addEventListener('click', selectTorrent)
                magnets.appendChild(li)
              })
            }
          }
        }
        listFiles()
      }
    }
    xhr.send()
  }, 1000)
} */

const formatBytes = (bytes, decimals) => {
  if (bytes === 0) {
    return '0 Byte'
  }
  const k = 1024
  const dm = decimals + 1 || 3
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

function log (value) {
  debug.innerHTML += value + '<br/>'
}
document.addEventListener('DOMContentLoaded', init)
