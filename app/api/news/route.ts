import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

export async function GET() {
  try {
    const feed = await parser.parseURL("https://ge.globo.com/rss/ge/futebol/");

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
    return NextResponse.json(
      { error: "Erro ao buscar notícias" },
      { status: 500 },
    );
  }
}
