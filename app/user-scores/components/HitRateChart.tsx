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
          <CardTitle>Pontos × Apostas por Apostador</CardTitle>
        </CardHeader>
        <CardContent>
          <ScatterPlot data={top} />
        </CardContent>
      </Card>
    </div>
  );
}

function ScatterPlot({ data }: { data: RankingItem[] }) {
  const maxValue = Math.max(...data.map((i) => Math.max(i.bets, i.points)), 1);
  const rowHeight = 26;
  const W = 420;
  const H = Math.max(140, data.length * rowHeight + 46);
  const leftPad = 120;
  const rightPad = 20;
  const topPad = 20;
  const plotWidth = W - leftPad - rightPad;

  const getX = (value: number) => leftPad + (value / maxValue) * plotWidth;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const value = Math.round(maxValue * ratio);
    return { x: getX(value), value };
  });

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Comparativo de pontos e apostas por apostador"
      >
        {/* Vertical grid lines and value ticks */}
        {ticks.map((tick, i) => (
          <g key={`tick-${i}`}>
            <line
              x1={tick.x}
              y1={topPad - 8}
              x2={tick.x}
              y2={H - 24}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
            <text
              x={tick.x}
              y={H - 8}
              textAnchor="middle"
              fontSize={9}
              fill="currentColor"
              opacity={0.6}
            >
              {tick.value}
            </text>
          </g>
        ))}

        {/* One row per bettor: left label + connecting segment + two dots */}
        {data.map((item, index) => {
          const y = topPad + index * rowHeight;
          const xBets = getX(item.bets);
          const xPoints = getX(item.points);
          const name = item.user.name;

          return (
            <g key={item.user.id}>
              <text
                x={leftPad - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill="currentColor"
                opacity={0.9}
              >
                {name.length > 18 ? `${name.slice(0, 18)}...` : name}
              </text>

              <line
                x1={Math.min(xBets, xPoints)}
                y1={y}
                x2={Math.max(xBets, xPoints)}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.4}
                strokeWidth={2}
              />

              <circle cx={xBets} cy={y} r={4.2} fill="#3B82F6">
                <title>{`${name}: ${item.bets} apostas`}</title>
              </circle>

              <circle cx={xPoints} cy={y} r={4.2} fill="#22C55E">
                <title>{`${name}: ${item.points} pontos`}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          Apostas
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
          Pontos
        </span>
      </div>
    </div>
  );
}
