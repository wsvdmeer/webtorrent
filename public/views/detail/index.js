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

const getEpisodeQuery = (title, episode) => {
  let s = `s${episode.season_number.toString()}`
  if (episode.season_number < 10) {
    s = `s0${episode.season_number}`
  }

  let e = `s${episode.episode_number.toString()}`
  if (episode.episode_number < 10) {
    e = `e0${episode.episode_number}`
  }

  return `${title} ${s} ${e}`
}

const typeOptions = async (view, type, data) => {
  const select = document.createElement('select')
  const episodes = document.createElement('ul')
  episodes.classList.add('episodes')
  data.seasons.forEach((season) => {
    const option = document.createElement('option')
    option.text = season.name
    option.setAttribute('value', season.season_number)
    select.appendChild(option)
  })
  view.appendChild(select)
  view.appendChild(episodes)

  select.addEventListener('change', async (e) => {
    // todo change url
    await fetchSeason(episodes, data, type, e.target.value)
  })
  await fetchSeason(episodes, data, type, select.options[0].value)
}

const fetchSeason = async (view, data, type, id) => {
  view.innerHTML = ''
  const tvTitle = getTitle(data)
  await fetch('/api/season/' + JSON.stringify({
    season: id,
    id: data.id
  }))
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      data.episodes.forEach((episode) => {
        console.log(episode)
        const item = document.createElement('li')
        item.classList.add('item')

        const link = document.createElement('a')
        link.setAttribute('href', `/searchtorrent?type=${type}&query=${getEpisodeQuery(tvTitle, episode)}`)
        link.setAttribute('target', '_self')
        item.appendChild(link)

        const img = document.createElement('img')
        img.setAttribute('src', `https://image.tmdb.org/t/p/w500${
          episode.still_path ? episode.still_path : data.poster_path
        }`)
        link.appendChild(img)

        const title = document.createElement('span')
        title.innerText = episode.name
        link.appendChild(title)

        view.appendChild(item)
      })
    })
}

const getDetails = async (type, id, query) => {
  await fetch('/api/detail/' + JSON.stringify({
    type: type,
    id: id,
    query: query
  }))
    .then((response) => response.json())
    .then(async (data) => {
      console.log(data)
      const title = document.createElement('h1')
      detailInfo.appendChild(title)
      title.innerText = getTitle(data)

      // check if series
      console.log(type)

      if (type === 'tv') {
        const infoContainer = document.createElement('div')
        infoContainer.classList.add('info')
        detailInfo.appendChild(infoContainer)
        await typeOptions(infoContainer, type, data)
      } else {
        const button = document.createElement('a')
        button.setAttribute('href', `/searchtorrent?type=${type}&query=${query}`)
        button.setAttribute('tartet', '_self')
        button.innerText = 'Download'
        detailInfo.appendChild(button)
      }

      backdrop.setAttribute('src', getImage(data))
    })
}

document.addEventListener('DOMContentLoaded', init)
