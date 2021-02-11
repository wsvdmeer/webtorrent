let magnetResults
let magnets
const removeTorrent = (event) => {
  const url = event.target.getAttribute('url')
  console.log('remove : ' + url)
  console.log(url)
  const encodedUri = encodeURIComponent(url)
  console.log(encodedUri)
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
  xhr.send()
}

const init = () => {
  magnets = document.getElementById('queue')
  listFiles()
}

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
      }
    }
  }
  xhr.send()
}

const streamTorrent = (hash, file) => {
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
                remove.setAttribute('path', item.path)
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
          } else {
            magnets.innerHTML = 'no torrents'
          }
        }
        listFiles()
      }
    }
    xhr.send()
  }, 1000)
}

document.addEventListener('DOMContentLoaded', init)
