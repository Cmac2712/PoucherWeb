const chromium = require('@sparticuz/chrome-aws-lambda');
const REGION = "eu-west-2";

exports.getBookmarkInfoHandler = async (event, context, callback) => {
    let browser = null;
    let pageTitle = null;
    let pageDescription = null;
    
    const req = JSON.parse(event.body); 

    try {
        browser = await chromium.puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        let page = await browser.newPage();

        await page.goto( decodeURIComponent(req?.url), {
            waitUntil: 'networkidle2'
        });

    pageTitle = await page.title();
    pageDescription = await page.$eval("head > meta[name='description']", element => element.content);

    } catch (error) {
        console.log('Error: ' ,error)
        return {
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            statusCode: 500,
            body: JSON.stringify(error)
        };
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify({
            'page': {
                'title': pageTitle,
                'description': pageDescription
            } 
        }) 
    };
};