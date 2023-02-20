import { IFeed, IFeedItem } from "syndication-fetcher";

export function scrubFeedContent(feed: IFeed, item: IFeedItem) {
  // Replace relative image paths with absolute paths
  return item.content.replace(/(\<img src=[\"'])(\/.*)([\"'])/, `$1${feed.link}$2$3`);
}
