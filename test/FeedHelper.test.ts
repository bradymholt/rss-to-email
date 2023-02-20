import { scrubFeedContent } from "../src/lib/FeedHelper";
describe("FeedHelper", () => {
  it("foo", () => {
    const feed = {
      title: "Test",
      description: "Test",
      link: "https://example.com",
      items: [],
    };
    const item = {
      id: "Test",
      title: "Test",
      description: "Test",
      link: "https://example.com",
      pubDate: new Date(),
      content: 'This is a test. <img src="/foo.jpg" /> This is only a test.',
    };

    const expected = 'This is a test. <img src="https://example.com/foo.jpg" /> This is only a test.';
    expect(scrubFeedContent(feed, item)).toBe(expected);
  });
});
