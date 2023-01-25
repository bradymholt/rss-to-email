#!/usr/bin/env npx ts-node-esm
import "jsh";
import { AppDataSource } from "../data-source.js";
import { Feed } from "../entity/Feed.js";
import { fetchFeedTitle } from "../lib/FeedParser.js";

const [url] = args.assertCount(1);

await AppDataSource.initialize();

const existingFeedByUrl = await Feed.findBy({ url });
if (existingFeedByUrl) {
  throw new Error(`Feed already exists: ${url}`);
}

echo(`Fetching feed at ${url} ...`);
const title = await fetchFeedTitle(url);

const newFeed = new Feed();
newFeed.url = url;
newFeed.title = title;
newFeed.createdAtEpoch = Date.now();
await newFeed.save();

await AppDataSource.destroy();
