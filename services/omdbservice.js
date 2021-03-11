// IMDB
// const imdb = require('imdb-api')
const http = require('http')
const omdbApiKey = 'e21a3e3d'
const baseUrl = `http://www.omdbapi.com/?apikey=${omdbApiKey}`
// const imdbClient = new imdb.Client({ apiKey: omdbApiKey })
class OMDBService {
  async episodes (imdbid, seasons, callback) {
    const url = `${baseUrl}&t=${imdbid}&season=1`
    http.get(url, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        try {
          const json = JSON.parse(body)
          // do something with JSON
          console.log(json)
        } catch (error) {
          console.error(error.message)
        };
      })
    }).on('error', (error) => {
      console.log(error)
    })
  }

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

    const type = 'series'

    const url = `${baseUrl}&type=${type}&t=${data.query}`
    console.log(url)

    http.get(url, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        try {
          const json = JSON.parse(body)
          // do something with JSON
          console.log(json)
          result.poster = json.Poster
          result.title = json.Title
          result.year = json.Year
          result.status = 200
          switch (type) {
            case 'series':
              this.episodes(json.imdbID, json.totalSeasons)
              break
            case 'movies':
              break
          }
        } catch (error) {
          console.error(error.message)
        };
      })
    }).on('error', (error) => {
      result.status = 500
      result.message = error
    })

    /*

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
          console.log(item)
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
    }) */
  }
}
module.exports = OMDBService
