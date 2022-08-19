const chromium = require('@sparticuz/chrome-aws-lambda');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const REGION = "eu-west-2";

const s3Client = new S3Client({ region: REGION });

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 800;
const S3_BUCKET_NAME = 'bookmarks-screenshots'; 

const addImageToS3 = async (key, file) => {
  try {
    const results = await s3Client.send(new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: file
    }));
    console.log(
        "Successfully created " +
        key +
        " and uploaded it to " +
        S3_BUCKET_NAME +
        "/" +
        key
    );
    return results; // For unit tests.
  } catch (err) {
    console.log("S3 PuObjectCommand Error: ", err);
  }
}

exports.screenshotHandler = async (event, context, callback) => {
    let screenshotBuffer = null;
    let thumbnailKey = null;
    let browser = null;

    const req = JSON.parse(event.body);

    let width = parseInt(req?.width);

    if (isNaN(width))
        width = DEFAULT_WIDTH;

    let height = parseInt(req?.height);

    if (isNaN(height))
        height = DEFAULT_HEIGHT;

    try {
        browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: { width, height },
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        let page = await browser.newPage();

        await page.goto( decodeURIComponent(req?.url), {
            waitUntil: 'networkidle2'
        });

        screenshotBuffer = await page.screenshot();

        thumbnailKey = `screenshot-${Date.now()}.png`;

        await addImageToS3(thumbnailKey, screenshotBuffer);

    } catch (error) {
        console.log('Error: ' ,error)
        return {
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
            thumbnailKey,
            pageTitle: 'howdy'
        }) 
    };
};