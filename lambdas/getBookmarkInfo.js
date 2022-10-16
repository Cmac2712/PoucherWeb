const chromium = require('@sparticuz/chrome-aws-lambda')
const REGION = 'eu-west-2'

async function getPageImage(page) {
  let pageImage = ''

  try {
    pageImage = await page.$eval(
      "head > meta[property='og:image']",
      (element) => element.content
    )
  } catch (error) {
    console.log(error)
  }

  return pageImage
}
async function getPageDescription(page) {
  let pageDescription = null

  // Try OG desc
  try {
    pageDescription = await page.$eval(
      "head > meta[property='og:description']",
      (element) => element.content
    )
  } catch (error) {
    console.log(error)
  }

  if (pageDescription !== null) return pageDescription

  try {
    pageDescription = await page.$eval(
      "head > meta[name='description']",
      (element) => element.content
    )
  } catch (error) {
    console.log(error)
  }

  if (pageDescription === null) return '--'

  return pageDescription
}

async function getPageTitle(page) {
  let pageTitle = null

  // Try OG title
  try {
    pageTitle = await page.$eval(
      "head > meta[property='og:title']",
      (element) => element.content
    )
  } catch (error) {
    console.log(error)
  }

  if (pageTitle !== null) return pageTitle

  // Try regular title
  try {
    pageTitle = await page.title()
  } catch (error) {
    console.log(error)
  }

  if (pageTitle === null) return '--'

  return pageTitle
}

exports.getBookmarkInfoHandler = async (event, context, callback) => {
  let browser = null
  let pageTitle = null
  let pageDescription = null
  let pageImage = null

  const req = JSON.parse(event.body)

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    })

    let page = await browser.newPage()

    await page.goto(decodeURIComponent(req?.url), {
      waitUntil: 'networkidle0'
    })

    pageTitle = await getPageTitle(page)
    pageDescription = await getPageDescription(page)
    pageImage = await getPageImage(page)
  } catch (error) {
    console.log('Error: ', error)
    return {
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      statusCode: 500,
      body: JSON.stringify(error)
    }
  } finally {
    if (browser !== null) {
      await browser.close()
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    },
    body: JSON.stringify({
      page: {
        title: pageTitle,
        description: pageDescription,
        image: pageImage
      }
    })
  }
}
