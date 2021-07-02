
let magnetResults
const results = document.getElementById('results')
const loader = document.getElementById('loader')
let timeout
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
      fetchData()
    })
}

const init = () => {
  loader.style.display = 'block'
  loader.innerText = 'loading...'
  scanDirectory()
  fetchData()
}

const streamTorrent = async (magnet, filename) => {
  window.location.href = '/player?magnet=' + magnet
}

const scanDirectory = async () => {
  loader.innerText = 'scanning directory...'
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

const fetchData = async () => {
  loader.innerText = 'fetching data...'
  clearTimeout(timeout)
  await fetch('/api/list/')
    .then((response) => response.json())
    .then((result) => {
      console.log(result)
      const filter = result.filter((x) => x.ready === true)
      results.innerHTML = ''
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
          results.appendChild(li)
        })
      }
    })
  loader.style.display = 'none'

  timeout = setTimeout(fetchData, 1000)
}

document.addEventListener('DOMContentLoaded', init)
