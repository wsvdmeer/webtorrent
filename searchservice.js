// IMDB
const imdb = require('imdb-api')
const omdbApiKey = 'e21a3e3d'
const imdbClient = new imdb.Client({ apiKey: omdbApiKey })
class SearchService {
  async search (json, callback) {
    const data = JSON.parse(json)
    const result = {
      status: 200,
      message: '',
      title: '',
      poster: '',
      results: [],
      type: '',
      year: ''
    }

    await imdbClient.get({ name: data.query }).then((search) => {
      result.poster = search.poster
      result.title = search.name
      result.year = search.year
      result.status = 200
      switch (search.constructor.name) {
        case 'Movie':
          result.type = 'movie'
          break
        case 'TVShow':
          result.type = 'tv'
          return search.episodes()
      }
    }).then((eps) => {
      if (eps) {
        const episodes = []
        eps.forEach((item) => {
          // console.log(item)
          if (item.poster === undefined) {
            item.poster = result.poster
          }
          episodes.push(item)
        })
        result.results = episodes
      }
      // res.send(JSON.stringify(result))
    }).catch((error) => {
      result.status = 500
      result.message = error
    }).finally(() => {
      callback(result)
    })
  }
}
module.exports = SearchService
