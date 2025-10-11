import feed from "../api/feed.js";
import request from "supertest";
import { parseStringPromise } from "xml2js";
import { createServer } from "vercel-node-server";

let app;

beforeAll(async () => {
  app = createServer(feed);
});

afterAll(() => {
  app.close();
});

describe("Feed returns the expected responses", () => {
  it("Should be valid XML", async () => {
    const response = await request(app)
      .get("/feed/arena-influences")
      .expect("Content-Type", "application/rss+xml;charset=utf-8")
      .expect(200);
    const responseXML = response.text;
    const parsedXML = await parseStringPromise(responseXML);
    expect(parsedXML).toBeTruthy();
  });

  it("Should present 17 items from a channel", async function () {
    const response = await request(app)
      .get("/feed/protocol-platform-peers")
      .expect("Content-Type", "application/rss+xml;charset=utf-8")
      .expect("Content-Length", "15986")
      .expect(200);
    const responseXML = response.text;
    const feedItems = await parseStringPromise(responseXML)
      .then((result) => result.rss.channel[0].item);
    expect(feedItems).toHaveLength(17);
  });
});
