
let magnetResults
const queue = document.getElementById('queue')
const removeTorrent = async (magnet) => {
  await fetch('/api/remove/', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ magnet: magnet })
  }).then((response) => response.json())
    .then((data) => {
      console.log(data)
      // this.window.location = '/torrents'
    })

  /* const url = event.target.getAttribute('url')
  const encodedUri = encodeURIComponent(url)
  const query = {
    url: encodedUri
  }
  const xhr = new XMLHttpRequest()
  xhr.open('GET', '/remove/' + JSON.stringify(query), true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.responseText) {
        console.log(xhr.responseText)
      }
    }
  }
  xhr.send() */
}

const init = () => {
  scanDirectory()
  listFiles()
}

/*
const selectTorrent = (event) => {
  const url = event.target.getAttribute('url')
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
        // autoplay first item
        streamTorrent(results[0].hash, results[0].name)

        // window.location.href = '/player'
      }
    }
  }
  xhr.send()
} */

const streamTorrent = async (magnet) => {
  await fetch('/api/play/', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ magnet: magnet })
  }).then((response) => response.json())
    .then((data) => {
      console.log(data)
      window.location.href = '/player'
    })
}

const scanDirectory = async () => {
  await fetch('/api/scan/')
}

const formatBytes = (bytes, decimals) => {
  if (bytes === 0) {
    return '0 Bytes'
  }
  const k = 1024
  const dm = decimals + 1 || 3
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const listFiles = () => {
  setTimeout(async () => {
    await fetch('/api/list/')
      .then((response) => response.json())
      .then((results) => {
        console.log(results)
        const filter = results.filter((x) => x.ready === true)
        queue.innerHTML = ''
        if (filter.length > 0) {
          // if (JSON.stringify(results) !== JSON.stringify(magnetResults)) {
          magnetResults = filter

          magnetResults.forEach(item => {
            const li = document.createElement('li')
            const title = document.createElement('h2')
            title.innerText = item.name
            li.appendChild(title)

            const downloaded = document.createElement('div')
            downloaded.innerText = `downloaded ${formatBytes(item.downloaded, 2)}`
            li.appendChild(downloaded)

            const uploaded = document.createElement('div')
            uploaded.innerText = `uploaded ${formatBytes(item.uploaded, 2)}`
            li.appendChild(uploaded)

            const downloadSpeed = document.createElement('div')
            downloadSpeed.innerText = `download speed ${formatBytes(item.downloadSpeed, 2)}`
            li.appendChild(downloadSpeed)

            const progressBar = document.createElement('div')
            progressBar.classList.add('progressbar')
            li.appendChild(progressBar)

            const progress = document.createElement('div')
            progressBar.appendChild(progress)
            progress.style.width = `${item.progress * 100}%`

            /* const infoList = document.createElement('div')
              li.appendChild(infoList) */

            const remove = document.createElement('button')
            remove.innerText = 'Remove'
            li.appendChild(remove)
            // remove.setAttribute('magnet', item.magnetUri)
            // remove.setAttribute('path', item.path)
            remove.addEventListener('click', () => { removeTorrent(item.magnetUri) })

            const play = document.createElement('button')
            play.innerText = 'Play'
            li.appendChild(play)
            play.setAttribute('url', item.magnetUri)
            play.addEventListener('click', () => { streamTorrent(item.infoHash, item.path) })

            /* let infoText = ''

              for (const [key, value] of Object.entries(item)) {
                infoText += `${key} : ${value}\n`
              }
              infoList.innerText = infoText */

            // li.innerText = item.name + '/' + item.infoHash + '/' + item.path
            //
            // li.addEventListener('click', selectTorrent)
            queue.appendChild(li)
          })
        }
        // } else {
        // queue.innerHTML = 'no torrents'
        // }

        listFiles()
      })
  }, 10000)
}

document.addEventListener('DOMContentLoaded', init)
