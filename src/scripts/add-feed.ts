#!/usr/bin/env npx ts-node-esm
import "jsh";
import { AppDataSource } from "../data-source.js";
import { Feed } from "../entity/Feed.js";
import { fetchFeed } from "syndication-fetcher";

const [url] = args.assertCount(1);

await AppDataSource.initialize();

const existingFeedByUrl = await Feed.findOneBy({ url });
if (existingFeedByUrl) {
  throw new Error(`Feed already exists: ${url}`);
}

echo(`Fetching feed at ${url} ...`);
const feed = await fetchFeed(url);

const newFeed = new Feed();
newFeed.url = url;
newFeed.title = feed.title;
newFeed.createdAtEpoch = Date.now();
await newFeed.save();

await AppDataSource.destroy();
