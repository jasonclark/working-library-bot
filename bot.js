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

    const rawContent = await fs.readFile(fileName, "utf8");
    const cleanQuotes = rawContent
      .split("\n")
      .map(line => line.match(/"(.*?)"/)?.[1] || line.trim())
      .filter(line => line !== "");

    const quote1 = chooseRandom(cleanQuotes);
    //check for second quote that won't break 300 char limit
    const validSecondQuotes = cleanQuotes.filter(q => (quote1.length + q.length + 1) <= 300);
    
    if (validSecondQuotes.length === 0) throw new Error("Could not find a short enough combo.");
    
    const post = `${quote1} ${chooseRandom(validSecondQuotes)}`;
    console.log("Drafting Post:", post);

    const agent = new BskyAgent({ service: "https://bsky.social/" });
    await agent.login({
      //can use config.parsed in place of process.env below - switched to make github workflow actions and secrets work.
      identifier: process.env.BLUESKY_BOT_USERNAME,
      password: process.env.BLUESKY_BOT_PASSWORD,
    });
    
    //const rt = new RichText({ text: fileContent.body }); 
    const rt = new RichText({ text: post });
    await rt.detectFacets(agent);

    const postRecord = {
      $type: "app.bsky.feed.post",
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    };

    await agent.post(postRecord);
  } catch (err) {
    console.error("Bot Failed to Post:", err);
    process.exit(1);
  }
};

generateLibraryQuote();