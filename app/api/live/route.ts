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
      { cache: "no-store" },
    );

    const data: SofaScoreResponse = await res.json();

    const matches = data.events
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
    return NextResponse.json(
      { error: "Erro ao buscar jogos ao vivo" },
      { status: 500 },
    );
  }
}
