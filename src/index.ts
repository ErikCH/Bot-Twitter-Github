import dotenv from 'dotenv'
import puppeteer from "puppeteer";
import { format } from "date-fns";
import Twitter from 'twitter';
import fetch from 'node-fetch';

dotenv.config()


const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY as string,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET as string,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY as string,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string
});

const URL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=UUshZ3rdoCLjDYuTR_RBubzw&maxResults=1&key=${process.env.GOOGLE_ACCESS_KEY}`

const VIDEO_URL = 'https://www.youtube.com/watch?v='



async function grabYTData(){

  const data = await fetch(URL);

  const json = await data.json();
  console.log(json);
  return json.items[0].snippet.resourceId.videoId;



}

async function grabGithubData(): Promise<string> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(
    "https://github.com/users/erikch/contributions?from=2021-01-01"
  );
  let contribs = await page.$$eval("[data-count]", (val) =>
    val.reduce((acc, val) => acc + +(val.getAttribute("data-count")!) , 0)
  );

  const currentYear = format(new Date(), "yyyy");
  await browser.close();
  return `${currentYear} Github Contributions: ${contribs}`;
}

async function main() {
  const ans = await grabGithubData();
  const yt = await grabYTData();
  const website = `${VIDEO_URL}${yt}`;
  const params = {
    location: ans,
    url:website
  };




  await client.post("account/update_profile", params);
    console.log("🎉 Success! Updated Twitter bio/location and website");
}

main().catch(err=> console.log(err))
