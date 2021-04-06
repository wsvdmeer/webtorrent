// IMDB
const fetch = require('node-fetch')
const omdbApiKey = process.env.OMDB_API_KEY
const baseUrl = `http://www.omdbapi.com/?apikey=${omdbApiKey}`
class OMDBService {
  async seasons (imdbid, seasons, current, callback) {

  }

  async search (json) {
    const data = JSON.parse(json)
    const info = {
      detail: {},
      seasons: []
    }
    try {
      const result = await fetch(`${baseUrl}&type=${data.type}&t=${data.query}`).then(response => response.json())
      if (result.Poster) {
        result.Poster = result.Poster.replace('300.jpg', '1920.jpg')
      }
      info.detail = result
      if (result.Type === 'series') {
        for (let i = 0; i < result.totalSeasons; i++) {
          const season = await fetch(`${baseUrl}&t=${result.imdbID}&season=${i + 1}`).then(response => response.json())
          const seasonData = {
            episodes: []
          }
          info.seasons.push(seasonData)
          for (let e = 0; e < season.Episodes.length; e++) {
            const episode = season.Episodes[e]
            const detail = await fetch(`${baseUrl}&type=episode&i=${episode.imdbID}`).then(response => response.json())
            seasonData.episodes.push(detail)
          }
        }
      }
      return info
    } catch (e) {

    }
  }
}

module.exports = OMDBService
