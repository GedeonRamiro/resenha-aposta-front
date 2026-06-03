import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();
const NEWS_FEED_URL = "https://ge.globo.com/rss/ge/futebol/";

export async function GET() {
  try {
    const response = await fetch(NEWS_FEED_URL, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
      headers: {
        Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json([]);
    }

    const xml = await response.text();
    const feed = await parser.parseString(xml);

    const news = feed.items.slice(0, 10).map((item) => ({
      title: item.title,
      description: item.contentSnippet,
      image: item.enclosure?.url || null,
      url: item.link,
      date: item.pubDate,
      source: "Globo Esporte",
    }));

    return NextResponse.json(news);
  } catch {
    return NextResponse.json([]);
  }
}
