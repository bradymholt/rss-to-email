#!/usr/bin/env -S npx ts-node-esm
import "jsh";

import { AppDataSource } from "../data-source.js";
import { Feed, FeedBatching } from "../entity/Feed.js";
import { FeedItem } from "../entity/FeedItem.js";
import { sendEmail } from "../lib/Mailer.js";
import { fetchFeed } from "syndication-fetcher";
import type { IFeed, IFeedItem } from "syndication-fetcher";
import { isFeedItemDueForDelivery, scrubFeedContent } from "../lib/FeedHelper.js";

await AppDataSource.initialize();

const itemsToBeSentGroupedById: { [feedId: string]: Array<IFeedItem> } = {};
const batchedItemsToBeSentGroupedById: { [feedId: string]: Array<IFeedItem> } = {};
const allFeeds = await Feed.find();
const feedsById = allFeeds.reduce((acc, feed) => {
  acc[feed.id] = feed;
  return acc;
}, {} as { [feedId: string]: Feed });

for (const feed of allFeeds) {
  echo(`Processing feed: ${feed.title} (${feed.url}) ...`);
  const feedItems = await feed.items;
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

        if (
          feed.batching == FeedBatching.DailyBatch ||
          feed.batching == FeedBatching.WeeklyBatch ||
          feed.batching == FeedBatching.MonthlyBatch
        ) {
          batchedItemsToBeSentGroupedById[feed.id] = batchedItemsToBeSentGroupedById[feed.id] ?? []; // ensure array initialized for feedId
          batchedItemsToBeSentGroupedById[feed.id].push(fetchedItem);
        } else {
          itemsToBeSentGroupedById[feed.id] = itemsToBeSentGroupedById[feed.id] ?? []; // ensure array initialized for feedId
          itemsToBeSentGroupedById[feed.id].push(fetchedItem);
        }
      }
    }
  }
}

if (Object.keys(itemsToBeSentGroupedById).length == 0) {
  // Nothing to send
  exit();
}

// Individual feed items
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

    await FeedItem.insert({ feed, guid: feedItem.id, emailSentAtEpoch: Date.now() });
  }

  echo(`Sending email for feed '${feed.url}' (id: ${feedId}) ...`);
  await sendEmail(`[rss-to-email] New post from ${feed.title}`, emailBody);
  await Feed.update(feedId, { lastEmailSentAtEpoch: +Date.now() });
}

// Batched items
if (Object.keys(batchedItemsToBeSentGroupedById).length > 0) {
  let emailBody = "";
  for (const feedId of Object.keys(batchedItemsToBeSentGroupedById)) {
    const feed = feedsById[feedId];
    const feedIdItemsToBeSent = batchedItemsToBeSentGroupedById[feedId];

    emailBody += `<h1>Feed: ${feed.title} (items: ${feedIdItemsToBeSent.length})</h1>`;
    for (const feedItem of feedIdItemsToBeSent) {
      const itemContent = scrubFeedContent(feed, feedItem.content);

      emailBody += `\
<h2>${feedItem.title}</h2>
<p>Direct Link: <a href="${feedItem.link}">${feedItem.link}</a></p>
${itemContent}`;

      await FeedItem.insert({ feed, guid: feedItem.id, emailSentAtEpoch: Date.now() });
    }

    await Feed.update(feedId, { lastEmailSentAtEpoch: +Date.now() });
  }

  await sendEmail(`[rss-to-email] New batch posts!`, emailBody);
}

await AppDataSource.destroy();
