let player
let info
let tempVideo
const init = () => {
  info = document.getElementById('info')
  player = document.getElementById('video')
  checkStream()
}

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
          if (result.hash && result.filename) {
            const currentVideo = '/stream/' + result.hash + '/' + result.filename
            if (tempVideo !== currentVideo) {
              player.setAttribute('src', currentVideo)
              tempVideo = currentVideo
            }
          }
          info.innerText = `hash ${result.hash} filename ${result.filename}`
        }
        checkStream()
      }
    }
    xhr.send()
  }, 1000)
}

document.addEventListener('DOMContentLoaded', init)
