import { IFeedItem } from "syndication-fetcher";
import { Feed, FeedBatching } from "../entity/Feed.js";

export function scrubFeedContent(feed: Feed, content: string) {
  // Replace relative image paths with absolute paths
  return content.replace(/(\<img src=[\"'])(\/.*)([\"'])/, `$1${feed.url}$2$3`);
}

export function isFeedItemDueForDelivery(feed: Feed, item: IFeedItem) {
  if (!item.pubDate) return false;
  if (!feed.lastEmailSentAtEpoch) return true;

  switch (feed.batching) {
    case FeedBatching.None:
    case FeedBatching.DailyBatch:
      return true;
    case FeedBatching.Weekly:
    case FeedBatching.WeeklyBatch:
      return daysBetweenDates(new Date(feed.lastEmailSentAtEpoch), item.pubDate) >= 7;
    case FeedBatching.Monthly:
    case FeedBatching.MonthlyBatch:
      return daysBetweenDates(new Date(feed.lastEmailSentAtEpoch), item.pubDate) >= 30;
    default:
      ((x: never) => {
        throw new Error(`${x} was unhandled!`);
      })(feed.batching);
  }
}

export function daysBetweenDates(date1: Date, date2: Date) {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
