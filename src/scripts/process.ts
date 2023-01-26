import "jsh";

import { AppDataSource } from "../data-source.js";
import { Feed } from "../entity/Feed.js";
import { UserFeedItem } from "../entity/UserFeedItems.js";
import { fetchFeedItems, IFeedItem } from "../lib/FeedParser.js";
import { sendEmail } from "../lib/Mailer.js";

await AppDataSource.initialize();

const allFeeds = await Feed.find();
for (const feed of allFeeds) {
  echo(`Processing feed: ${feed.title} (${feed.url}) ...`);
  const items = feed.items;
  const processedLinkUrls = (items && items.map((item) => item.linkUrl)) || [];
  const feedItems = await fetchFeedItems(feed.url);
  const itemsToBeSent: Array<IFeedItem> = [];
  for (let item of feedItems) {
    if (item.publishedAtEpoch <= feed.createdAtEpoch) {
      echo(`  ${item.title} (${item.link}) [published before feed added]`);
    }
    if (processedLinkUrls.includes(item.link)) {
      echo(`  ${item.title} (${item.link}) [already sent]`);
    } else {
      echo.green(`  ${item.title} (${item.link}) [new]`);
      itemsToBeSent.push(item);
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

    const newFeedItem = new UserFeedItem();
    newFeedItem.linkUrl = item.link!;
    newFeedItem.delivered = true;
    newFeedItem.feed = feed;
    await newFeedItem.save();

    break;
  }
}

await AppDataSource.destroy();
