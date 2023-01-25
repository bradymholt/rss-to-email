import rssToJson from "rss-to-json";
const { parse } = <any>rssToJson;

export interface IFeedItem {
  // standard fields
  title: string;
  link: string;
  pubDate: string;
  guid: string;
  description: string;
  // custom fields
  content: string;
  publishedAtEpoch: number;
}

export async function fetchFeedTitle(feedUrl: string) {
  const feed = await parse(feedUrl);
  return feed.title;
}

export async function fetchFeedItems(feedUrl: string) {
  const feed = await parse(feedUrl);
  const items: Array<IFeedItem> = feed.items?.map((item: any) => {
    const content = item["content_encoded"] || item.description;
    const publishedAtEpoch = new Date(item.pubDate).getTime();
    return Object.assign(item, { content, publishedAtEpoch });
  });

  return items;
}
