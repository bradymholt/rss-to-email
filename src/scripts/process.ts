#!/usr/bin/env -S npx ts-node-esm
import "jsh";

import { AppDataSource } from "../data-source.js";
import { Feed } from "../entity/Feed.js";
import { UserFeedItem } from "../entity/UserFeedItems.js";
import { fetchFeedItems } from "../lib/FeedParser.js";
import { sendEmail } from "../lib/Mailer.js";

await AppDataSource.initialize();

const allFeeds = await Feed.find();
for (const feed of allFeeds) {
  const items = feed.items;
  const processedLinkUrls = (items && items.map((item) => item.linkUrl)) || [];
  const feedItems = await fetchFeedItems(feed.url);
  const itemsToBeSent = feedItems?.filter(
    (item) => item.publishedAtEpoch > feed.createdAtEpoch && !processedLinkUrls.includes(item.link)
  );

  if (!itemsToBeSent) continue;

  for (const item of itemsToBeSent) {
    await sendEmail(`New Feed Item:${feed.title}:${item.title}`, item.content);

    const newFeedItem = new UserFeedItem();
    newFeedItem.linkUrl = item.link!;
    newFeedItem.delivered = true;
    newFeedItem.feed = feed;
    await newFeedItem.save();

    break;
  }
}

await AppDataSource.destroy();
