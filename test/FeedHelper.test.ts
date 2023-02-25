import { Feed } from "../src/entity/Feed";
import { daysBetweenDates, scrubFeedContent } from "../src/lib/FeedHelper";

describe("FeedHelper", () => {
  it("scrubFeedContent", () => {
    const feed = new Feed();
    feed.id = 1;
    feed.title = "Test";
    feed.url = "https://example.com";
    feed.createdAtEpoch = 123;

    expect(scrubFeedContent(feed, `This is a test. <img src="/foo.jpg" /> This is only a test.`)).toBe(
      `This is a test. <img src="https://example.com/foo.jpg" /> This is only a test.`
    );
  });

  it("daysBetweenDates", () => {
    const date = new Date();
    let date2 = date;
    expect(daysBetweenDates(date, date2)).toBe(0);
    date2 = new Date(date.getTime() + 1000 * 60 * 60 * 24 * 7);
    expect(daysBetweenDates(date, date2)).toBe(7);
  });
});
