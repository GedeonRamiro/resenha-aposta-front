import { NextResponse } from "next/server";

interface Team {
  name: string;
}

interface Score {
  current?: number;
}

interface Status {
  type?: string;
  description?: string;
}

interface Tournament {
  name: string;
}

interface Event {
  id: number;
  tournament: Tournament;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: Score;
  awayScore?: Score;
  status?: Status;
}

interface SofaScoreResponse {
  events: Event[];
}

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const res = await fetch(
      `https://api.sofascore.com/api/v1/sport/football/scheduled-events/${today}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      },
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = (await res.json()) as Partial<SofaScoreResponse>;
    const events = Array.isArray(data.events) ? data.events : [];

    const matches = events
      .filter(
        (game) =>
          game.status?.type === "inprogress" ||
          game.status?.type === "halftime",
      )
      .map((game) => ({
        id: game.id,
        league: game.tournament.name,
        home: game.homeTeam.name,
        away: game.awayTeam.name,
        homeScore: game.homeScore?.current ?? 0,
        awayScore: game.awayScore?.current ?? 0,
        time: game.status?.description ?? "",
      }));

    return NextResponse.json(matches);
  } catch {
    return NextResponse.json([]);
  }
}
