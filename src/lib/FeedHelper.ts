import { Feed } from "../entity/Feed";

export function scrubFeedContent(feed: Feed, content: string) {
  // Replace relative image paths with absolute paths
  return content.replace(/(\<img src=[\"'])(\/.*)([\"'])/, `$1${feed.url}$2$3`);
}
