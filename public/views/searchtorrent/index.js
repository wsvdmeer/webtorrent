const results = document.getElementById('results')
const loader = document.getElementById('loader')
const error = document.getElementById('error')
error.style.display = 'none'
const init = () => {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  let type = urlParams.get('type')
  const query = urlParams.get('query')
  if (type === 'movie') {
    type = 'movies'
  }
  searchIndexers(type, query)
}

const getMagnet = async (torrent) => {
  await fetch('/api/add/', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(torrent)// body data type must match "Content-Type" header
  }).then((response) => response.json())
    .then((data) => {
      console.log(data)
      window.location.href = '/torrents'
    })
}

const searchIndexers = async (type, query) => {
  loader.style.display = 'block'
  await fetch('/api/searchindexers/' + JSON.stringify({
    type: type,
    query: query,
    page: 1
  }))
    .then((response) => response.json())
    .then((data) => {
      loader.style.display = 'none'
      if (data.length > 0) {
        error.style.display = 'none'
        data.forEach((torrent) => {
          const li = document.createElement('li')
          console.log(torrent)
          li.innerText = torrent.title
          results.appendChild(li)
          li.addEventListener('click', () => { getMagnet(torrent) })
        })
      } else {
        error.style.display = 'block'
        error.innerText = 'error loading data'
      }
    })
}

document.addEventListener('DOMContentLoaded', init)
