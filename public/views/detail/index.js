const results = document.getElementById('results')
const init = () => {
  const queryString = window.location.search
  console.log(queryString)
  const urlParams = new URLSearchParams(queryString)
  console.log(urlParams)
  let type = urlParams.get('type')
  const query = urlParams.get('query')
  if (type === 'movie') {
    type = 'movies'
  }
  searchIndexers(type, query)
}

const searchIndexers = async (type, query) => {
  await fetch('/searchindexers/' + JSON.stringify({
    type: type,
    query: query,
    page: 1
  }))
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        data.forEach((item) => {
          console.log(item)
          const li = document.createElement('li')
          li.innerText = item.title
          results.appendChild(li)
        })
      } else {
        const li = document.createElement('li')
        li.innerText = 'no results'
        results.appendChild(li)
      }
    })
}

document.addEventListener('DOMContentLoaded', init)
