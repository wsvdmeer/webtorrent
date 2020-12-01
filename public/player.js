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
          const result = JSON.parse(xhr.responseText)
          if (result.hash && result.filename) {
            const currentVideo = '/stream/' + result.hash + '/' + result.filenames
            if (tempVideo !== currentVideo) {
              player.removeAttribute('src')
              tempVideo = currentVideo
              player.setAttribute('src', tempVideo)
              console.log(`change to : hash ${result.hash} filename ${result.filename}`)
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
