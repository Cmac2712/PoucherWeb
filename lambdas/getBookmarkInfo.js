const fetch = require('node-fetch')
const metascraper = require('metascraper')([
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

const getBookmarkInfoHandler = async (event, context, callback) => {
  const url = decodeURIComponent(JSON.parse(event.body)?.url)
  const response = await fetch(url)
  const html = await response.text()

  const meta = await metascraper({
    url,
    html
  })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    },
    body: JSON.stringify({
      page: {
        ...meta
      }
    })
  }
}

exports.getBookmarkInfoHandler = getBookmarkInfoHandler
