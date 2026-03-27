import { NextResponse } from "next/server";

interface EspnTeam {
  displayName?: string;
}

interface EspnCompetitor {
  homeAway?: "home" | "away" | string;
  score?: string;
  team?: EspnTeam;
}

interface EspnStatusType {
  state?: string;
  detail?: string;
  shortDetail?: string;
}

interface EspnStatus {
  type?: EspnStatusType;
}

interface EspnCompetition {
  status?: EspnStatus;
  competitors?: EspnCompetitor[];
}

interface EspnLeague {
  name?: string;
}

interface EspnEvent {
  id?: string;
  league?: EspnLeague;
  competitions?: EspnCompetition[];
}

interface EspnScoreboardResponse {
  events?: EspnEvent[];
}

export const runtime = "nodejs";

export async function GET() {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard",
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Live provider unavailable (${res.status})` },
        { status: 502 },
      );
    }

    const data = (await res.json()) as EspnScoreboardResponse;
    const events = Array.isArray(data.events) ? data.events : [];

    const matches = events
      .map((event) => {
        const competition = event.competitions?.[0];
        const status = competition?.status?.type;

        if (status?.state !== "in") {
          return null;
        }

        const competitors = competition?.competitors ?? [];
        const home = competitors.find((c) => c.homeAway === "home");
        const away = competitors.find((c) => c.homeAway === "away");

        if (!home?.team?.displayName || !away?.team?.displayName || !event.id) {
          return null;
        }

        return {
          id: event.id,
          league: event.league?.name ?? "",
          home: home.team.displayName,
          away: away.team.displayName,
          homeScore: Number.parseInt(home.score ?? "0", 10) || 0,
          awayScore: Number.parseInt(away.score ?? "0", 10) || 0,
          time: status.shortDetail ?? status.detail ?? "",
        };
      })
      .filter((match): match is NonNullable<typeof match> => match !== null);

    return NextResponse.json(matches);
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while fetching live matches" },
      { status: 500 },
    );
  }
}
