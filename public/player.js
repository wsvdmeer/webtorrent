let player
let info
const init = () => {
  info = document.getElementById('info')
  player = document.getElementById('video')
  checkStream()
}

// SEARCH
/* const streamTorrent = (hash, file) => {
  player.setAttribute('src', '/stream/' + hash + '/' + file)
} */
const checkStream = () => {
  setTimeout(function () {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/currentstream/', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.responseText) {
          console.log(this.responseText)
          const result = JSON.parse(xhr.responseText)
          info.innerText = `hash ${result.hash} filename ${result.filename}`
        }
        checkStream()
      }
    }
    xhr.send()
  }, 1000)
}

document.addEventListener('DOMContentLoaded', init)
