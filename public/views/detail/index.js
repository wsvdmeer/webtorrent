const backdrop = document.getElementById('backdrop')
const detailInfo = document.getElementById('detail-info')

const init = () => {
  const queryString = window.location.search
  console.log(queryString)
  const urlParams = new URLSearchParams(queryString)
  console.log(urlParams)
  const type = urlParams.get('type')
  const query = urlParams.get('query')
  const id = urlParams.get('id')
  getDetails(type, id, query)
}

const getTitle = (item) => {
  if (item.name) {
    return item.name
  }
  return item.title
}

const getImage = (item) => {
  if (item.backdrop_path) {
    return `https://image.tmdb.org/t/p/original${item.backdrop_path}`
  }
}

const getDetails = async (type, id, query) => {
  await fetch('/api/detail/' + JSON.stringify({
    type: type,
    id: id,
    query: query
  }))
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      const title = document.createElement('h1')
      detailInfo.appendChild(title)
      title.innerText = getTitle(data)

      const button = document.createElement('a')
      button.setAttribute('href', `/searchtorrent?type=${type}&query=${query}`)
      button.setAttribute('tartet', '_self')
      button.innerText = 'Download'
      detailInfo.appendChild(button)

      backdrop.setAttribute('src', getImage(data))
    })
}

document.addEventListener('DOMContentLoaded', init)
