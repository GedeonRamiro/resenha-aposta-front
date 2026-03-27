import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankingItem } from "@/lib/user-scores";

export default function HitRateChart({ data }: { data: RankingItem[] }) {
  const top = data.slice(0, 10).filter((i) => i.bets > 0);
  if (top.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Aproveitamento (%) */}
      <Card>
        <CardHeader>
          <CardTitle>Aproveitamento por Apostador (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {top.map((item) => {
              const rate = (item.points / item.bets) * 100;
              const pct = Math.round(rate);
              const color =
                pct >= 60 ? "#22C55E" : pct >= 40 ? "#EAB308" : "#EF4444";
              return (
                <div key={item.user.id} className="flex items-center gap-3">
                  <span className="w-24 text-sm font-medium truncate shrink-0">
                    {item.user.name}
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{
                        width: `${Math.max(pct, 5)}%`,
                        backgroundColor: color,
                      }}
                    >
                      <span className="text-xs font-bold text-white drop-shadow">
                        {pct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              ≥ 60%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
              40–59%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              &lt; 40%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Pontos vs Apostas (SVG scatter-like) */}
      <Card>
        <CardHeader>
          <CardTitle>Pontos × Apostas</CardTitle>
        </CardHeader>
        <CardContent>
          <ScatterPlot data={top} />
        </CardContent>
      </Card>
    </div>
  );
}

function ScatterPlot({ data }: { data: RankingItem[] }) {
  const maxBets = Math.max(...data.map((i) => i.bets), 1);
  const maxPoints = Math.max(...data.map((i) => i.points), 1);
  const W = 300;
  const H = 180;
  const PAD = 30;

  const colors = [
    "#F59E0B",
    "#94A3B8",
    "#B45309",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#06B6D4",
    "#A855F7",
  ];

  const points = data.map((item, i) => ({
    cx: PAD + (item.bets / maxBets) * (W - PAD * 2),
    cy: H - PAD - (item.points / maxPoints) * (H - PAD * 2),
    color: colors[i % colors.length],
    label: item.user.name.split(" ")[0],
    bets: item.bets,
    points: item.points,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Axes */}
      <line
        x1={PAD}
        y1={PAD / 2}
        x2={PAD}
        y2={H - PAD}
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth={1}
      />
      <line
        x1={PAD}
        y1={H - PAD}
        x2={W - PAD / 2}
        y2={H - PAD}
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth={1}
      />

      {/* Axis labels */}
      <text
        x={W / 2}
        y={H - 4}
        textAnchor="middle"
        fontSize={9}
        fill="currentColor"
        opacity={0.5}
      >
        Apostas
      </text>
      <text
        x={8}
        y={H / 2}
        textAnchor="middle"
        fontSize={9}
        fill="currentColor"
        opacity={0.5}
        transform={`rotate(-90, 8, ${H / 2})`}
      >
        Pontos
      </text>

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.cx} cy={p.cy} r={6} fill={p.color} opacity={0.85} />
          <text
            x={p.cx}
            y={p.cy - 9}
            textAnchor="middle"
            fontSize={8}
            fill="currentColor"
            opacity={0.8}
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
