const twitterGetUrl = require("twitter-url-direct")

exports.videoHandler = async event => {

  let response = await twitterGetUrl(event.queryStringParameters.name)

  return {
    statusCode: 200,
    body: JSON.stringify({
        body: response 
    })
  }

}
