const type = document.getElementById('type')
const button = document.getElementById('button')
const input = document.getElementById('input')
const results = document.getElementById('results')
const info = document.getElementById('info')

const init = () => {
  // events
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      search(input.value, type.value)
    }
  })

  input.addEventListener('input', () => {
    console.log(input.value)
  })

  button.addEventListener('click', () => {
    search(input.value, type.value)
  })

  getInfo()
  // input.value = 'Mortal Kombat'
  // search(input.value, type.value)
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
  if (value) {
    results.innerHTML = ''
    await fetch('/api/search/' + JSON.stringify({
      type: type,
      query: value,
      page: 1
    }))
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          data.forEach((item) => {
            console.log(item)
            const name = getTitle(item)
            const li = document.createElement('li')
            const link = document.createElement('a')
            // todo got to /detail
            link.setAttribute('href', `/detail?type=${item.media_type ?? type}&id=${item.id}&query=${name}`)
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
        }
      })
  }
}

// todo make into component
const getInfo = () => {
  setTimeout(async () => {
    await fetch('/api/info/')
      .then((response) => response.json())
      .then((result) => {
        if (result) {
          info.innerText = `NETWORK [ external ip : ${result.network.externalip} country : ${result.network.country} internal ip ${result.network.internalip} port : ${result.network.port} ]  ACTIVITY [ download : ${result.torrents.downloadSpeed} upload : ${result.torrents.uploadSpeed} ratio :  ${result.torrents.ratio} progress ${result.torrents.progress} ]`
        }
      })
    getInfo()
  }, 1000)
}

document.addEventListener('DOMContentLoaded', init)
