// IMDB
const fetch = require('node-fetch')
const tmdbApiKey = process.env.TMDB_API_KEY
const baseUrl = 'https://api.themoviedb.org/3'
class TMDBService {
  async getSeasons (id, season) {
    const result = await fetch(`${baseUrl}/tv/${id}/season/${season}?api_key=${tmdbApiKey}`).then(response => response.json())
    return result
  }

  async getPopulair (type) {
    const result = await fetch(`${baseUrl}/populair/${type}?api_key=${tmdbApiKey}`).then(response => response.json())
    return result
  }

  async getTopRated (type) {
    const result = await fetch(`${baseUrl}/top_rated/${type}?api_key=${tmdbApiKey}`).then(response => response.json())
    return result
  }

  // type = multi / tv / movie
  async search (type, query) {
    console.log(type, query)
    const result = await fetch(`${baseUrl}/search/${type}?api_key=${tmdbApiKey}&query=${query}&page=1`).then(response => response.json())
    return result
  }
}

module.exports = TMDBService
