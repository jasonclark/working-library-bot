import blue from "@atproto/api";
import fs from "node:fs/promises";
import dotenv from "dotenv";

const config = dotenv.config();
const { BskyAgent, RichText } = blue;

//const fileName = "./posts.json";
const fileName = "./post-sources.txt";

const chooseRandom = (myArray) => myArray[Math.floor(Math.random() * myArray.length)];

const generateLibraryQuote = async () => {
  try {
    //const fileContent = JSON.parse(await fs.readFile(fileName));
    //console.log(fileContent);

    const fileContent = (await fs.readFile(fileName)).toString().split("\n");
    const post = `${chooseRandom(fileContent).trim().slice(1, -2)} ${chooseRandom(fileContent).trim().slice(1, -2)}`;
    console.log(post);

    const agent = new BskyAgent({ service: "https://bsky.social/" });
    await agent.login({
      identifier: process.env.BLUESKY_BOT_USERNAME,
      password: process.env.BLUESKY_BOT_PASSWORD,
      //identifier: config.parsed.BLUESKY_BOT_USERNAME,
      //password: config.parsed.BLUESKY_BOT_PASSWORD,
    });
    
    //const rt = new RichText({ text: fileContent.body }); 
    const rt = new RichText({ text: post });
    const postRecord = {
      $type: "app.bsky.feed.post",
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    };

    await agent.post(postRecord);
  } catch (err) {
    console.error("Error:", err);
  }
};

generateLibraryQuote();
