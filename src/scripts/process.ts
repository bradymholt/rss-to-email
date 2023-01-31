#!/usr/bin/env -S npx ts-node-esm
import "jsh";

import { AppDataSource } from "../data-source.js";
import { Feed } from "../entity/Feed.js";
import { FeedItems } from "../entity/FeedItems.js";
import { sendEmail } from "../lib/Mailer.js";
import { fetchFeed } from "syndication-fetcher";
import type { IFeed, IFeedItem } from "syndication-fetcher";

await AppDataSource.initialize();

const allFeeds = await Feed.find();
for (const feed of allFeeds) {
  echo(`Processing feed: ${feed.title} (${feed.url}) ...`);
  const feedItems = await feed.items;
  const itemsSentByGuid = (feedItems && feedItems.map((item) => item.guid)) || [];
  const fetchedFeed = await fetchFeed(feed.url);
  const itemsToBeSent: Array<IFeedItem> = [];

  for (let fetchedItem of fetchedFeed.items) {
    if (fetchedItem.publishedEpoch <= feed.createdAtEpoch) {
      echo(`\
  ${fetchedItem.id} [published before feed added]`);
    } else if (itemsSentByGuid.includes(fetchedItem.id)) {
      echo(`\
  ${fetchedItem.id} [already sent]`);
    } else {
      echo.green(`\
  ${fetchedItem.id} [new]`);
      itemsToBeSent.push(fetchedItem);
    }
  }

  if (!itemsToBeSent) continue;

  for (const item of itemsToBeSent) {
    echo(`Sending email for ${item.title} (${item.link}) ...`);
    const emailBody = `\
<h1>Feed: ${feed.title}</h1>
<h2>${item.title}</h2>
<p>Direct Link: <a href="${item.link}">${item.link}</a></p>
${item.content}
`;
    await sendEmail(`[rss-to-email] New post from ${feed.title}`, emailBody);
    await FeedItems.insert({ feed, guid: item.id, emailSentAtEpoch: Date.now() });
  }
}

await AppDataSource.destroy();
