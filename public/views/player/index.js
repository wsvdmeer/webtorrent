let player
// let videoControls
// let playButton
let magnet
const init = () => {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  magnet = urlParams.get('magnet')

  console.log('magnet', magnet)
  player = document.getElementById('video')
  // videoControls = document.getElementById('video-controls')

  // player.controls = false
  // player.addEventListener('play', updatePlayState);
  // player.addEventListener('pause', updatePlayState);

  // playButton = document.getElementById('play')
  // playButton.addEventListener('click', togglePlay);

  // checkStream()

  // const currentVideo = '/stream/' + magnet
  player.setAttribute('src', 'api/stream/' + magnet)
}

/*
const updatePlayState = () => {
  if (player.paused) {

  } else {

  }
}

const togglePlay = () => {
  if (player.paused || player.ended) {
    player.play()
  } else {
    player.pause()
  }
} */
/*
const checkStream = async () => {
  await fetch(`/api/stream/${magnet}`, {
    method: 'GET' // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ magnet: magnet })
  }).then((response) => response.json())
    .then((data) => {
      console.log(data)
      // this.window.location = '/torrents'
    })

  /* setTimeout(function () {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/play/', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.responseText) {
          const result = JSON.parse(xhr.responseText)
          if (result.hash && result.filename) {
            const currentVideo = '/stream/' + result.hash + '/' + result.filename
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
} */

document.addEventListener('DOMContentLoaded', init)
