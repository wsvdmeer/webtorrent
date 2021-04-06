// IMDB
const fetch = require('node-fetch')
const tmdbApiKey = process.env.TMDB_API_KEY
const baseUrl = 'https://api.themoviedb.org/3'
class TMDBService {
  async search (json) {
    const data = JSON.parse(json)
    const info = {
      type: '',
      detail: {},
      seasons: []
    }
    try {
      let type = 'movie'
      if (data.type === 'series') {
        type = 'tv'
      }
      const result = await fetch(`${baseUrl}/search/${type}?api_key=${tmdbApiKey}&query=${data.query}&page=1`).then(response => response.json())
      console.log('result' + result.results[0].id)
      const details = await fetch(`${baseUrl}/${type}/${result.results[0].id}?api_key=${tmdbApiKey}`).then(response => response.json())
      console.log('details' + details.name)
      info.type = type
      info.detail = details
      if (type === 'tv') {
        for (let s = 0; s < details.seasons.length; s++) {
          const season = await fetch(`${baseUrl}/${type}/${details.id}/season/${s + 1}?api_key=${tmdbApiKey}`).then(response => response.json())
          info.seasons.push(season)
        }
        return info
      }
      console.log('befor return : ' + info.seasons.length)
    } catch (e) {

    }
  }
}

module.exports = TMDBService
