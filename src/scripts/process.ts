#!/usr/bin/env -S npx ts-node-esm
import "jsh";

import { AppDataSource } from "../data-source.js";
import { Feed } from "../entity/Feed.js";
import { FeedItem } from "../entity/FeedItem.js";
import { sendEmail } from "../lib/Mailer.js";
import { fetchFeed } from "syndication-fetcher";
import type { IFeed, IFeedItem } from "syndication-fetcher";
import { isFeedItemDueForDelivery, scrubFeedContent } from "../lib/FeedHelper.js";

await AppDataSource.initialize();

const itemsToBeSentGroupedById: { [feedId: string]: Array<IFeedItem> } = {};
const allFeeds = await Feed.find();
const feedsById = allFeeds.reduce((acc, feed) => {
  acc[feed.id] = feed;
  return acc;
}, {} as { [feedId: string]: Feed });

for (const feed of allFeeds) {
  echo(`Processing feed: ${feed.title} (${feed.url}) ...`);
  const feedItems = await feed.items;
  const feedBatching = feed.batching;
  const itemsSentByGuid = (feedItems && feedItems.map((item) => item.guid)) || [];
  const fetchedFeed = await fetchFeed(feed.url);

  for (let fetchedItem of fetchedFeed.items) {
    if (!fetchedItem.pubDate) continue;

    const fetchedItemPubDateEpoch = fetchedItem.pubDate.getTime();
    if (fetchedItemPubDateEpoch <= feed.createdAtEpoch) {
      echo(`\
  ${fetchedItem.id} [published before feed added]`);
    } else if (itemsSentByGuid.includes(fetchedItem.id)) {
      echo(`\
  ${fetchedItem.id} [already sent]`);
    } else {
      const isDueForDelivery = isFeedItemDueForDelivery(feed, fetchedItem);
      if (!isDueForDelivery) {
        echo(`\
  ${fetchedItem.id} [not due for delivery yet]`);
      } else {
        echo.green(`\
  ${fetchedItem.id} [new]`);
        itemsToBeSentGroupedById[feed.id] = itemsToBeSentGroupedById[feed.id] ?? []; // ensure array initialized for feedId
        itemsToBeSentGroupedById[feed.id].push(fetchedItem);
      }
    }
  }
}

if (Object.keys(itemsToBeSentGroupedById).length == 0) {
  // Nothing to send
  exit();
}

// Send one email per feed
for (const feedId of Object.keys(itemsToBeSentGroupedById)) {
  const feed = feedsById[feedId];
  const feedIdItemsToBeSent = itemsToBeSentGroupedById[feedId];
  let emailBody = `<h1>Feed: ${feed.title} (items: ${feedIdItemsToBeSent.length})</h1>`;

  for (const feedItem of feedIdItemsToBeSent) {
    const itemContent = scrubFeedContent(feed, feedItem.content);

    emailBody += `\
<h2>${feedItem.title}</h2>
<p>Direct Link: <a href="${feedItem.link}">${feedItem.link}</a></p>
${itemContent}`;
  }

  echo(`Sending email for feed '${feed.url}' (id: ${feedId}) ...`);

  await sendEmail(`[rss-to-email] New post from ${feed.title}`, emailBody);
  for (const feedItem of feedIdItemsToBeSent) {
    await FeedItem.insert({ feed, guid: feedItem.id, emailSentAtEpoch: Date.now() });
  }

  await Feed.update(feedId, { lastEmailSentAtEpoch: +Date.now() });
}

await AppDataSource.destroy();
