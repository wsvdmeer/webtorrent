const loader = document.getElementById('loader')
const error = document.getElementById('error')
const type = document.getElementById('type')
// const button = document.getElementById('button')
const input = document.getElementById('input')
const results = document.getElementById('results')
const info = document.getElementById('info')
let infoTimer
let searchTimeout
let tempSearch
let tempSelect

const init = () => {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const currentType = urlParams.get('type')
  const currentQuery = urlParams.get('query')

  type.addEventListener('change', () => {
    console.log('type')
    if (tempSelect !== type.value) {
      startSearch()
      tempSelect = type.value
    }
  })

  input.addEventListener('input', () => {
    console.log('input')
    if (tempSearch !== input.value) {
      startSearch()
      tempSearch = input.value
    }
  })

  console.log(currentType, currentQuery)

  setInitialValues(currentType, currentQuery)

  getInfo()
}

const setInitialValues = (currentType, currentQuery) => {
  if (currentType) {
    type.value = currentType
    type.dispatchEvent(new Event('change'))
  }
  if (currentQuery) {
    input.value = currentQuery
    input.dispatchEvent(new Event('input'))
  }
}

const updateQuery = () => {
  const searchParams = new URLSearchParams(window.location.search)
  if (type.value) {
    searchParams.set('type', type.value)
  }
  if (input.value) {
    searchParams.set('query', input.value)
  }
  const newRelativePathQuery =
    window.location.pathname + '?' + searchParams.toString()
  history.pushState(null, '', newRelativePathQuery)
}

const startSearch = () => {
  updateQuery()
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    console.log(input.value)
    search(input.value, type.value)
  }, 250)
}

// TODO create utils
const getTitle = (item) => {
  if (item.name) {
    return item.name
  }
  return item.title
}

const getImage = (item) => {
  if (item.poster_path) {
    return `https://image.tmdb.org/t/p/w500${item.poster_path}`
  }
  return ''
}

const search = async (value, type) => {
  loader.style.display = 'block'
  results.innerHTML = ''
  if (value) {
    await fetch(
      '/api/search/' +
        JSON.stringify({
          type: type,
          query: value,
          page: 1
        })
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          error.style.display = 'none'
          data.forEach((item) => {
            // console.log(item)
            const name = getTitle(item)
            const li = document.createElement('li')
            const link = document.createElement('a')
            // todo got to /detail
            link.setAttribute(
              'href',
              `/detail?type=${item.media_type ?? type}&id=${
                item.id
              }&query=${name}`
            )
            link.setAttribute('target', '_self')
            li.appendChild(link)

            const title = document.createElement('div')
            title.innerText = name
            const img = document.createElement('img')

            img.setAttribute('src', getImage(item))
            link.appendChild(img)
            link.appendChild(title)
            results.appendChild(li)
          })
        } else {
          error.style.display = 'block'
          error.innerText = 'error loading data'
        }
      })
  }
  loader.style.display = 'none'
}

// todo make into component
const getInfo = async () => {
  clearTimeout(infoTimer)
  await fetch('/api/info/')
    .then((response) => response.json())
    .then((result) => {
      if (result) {
        info.innerText = `NETWORK [ external ip : ${result.network.externalip} country : ${result.network.country} internal ip ${result.network.internalip} port : ${result.network.port} ]  ACTIVITY [ download : ${result.torrents.downloadSpeed} upload : ${result.torrents.uploadSpeed} ratio :  ${result.torrents.ratio} progress ${result.torrents.progress} ]`
      }
    })
  infoTimer = setTimeout(() => { getInfo() }, 1000)
}

document.addEventListener('DOMContentLoaded', init)
