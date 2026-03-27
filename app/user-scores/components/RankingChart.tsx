import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { RankingItem } from "@/lib/user-scores";

const PODIUM_COLORS = [
  { bar: "#F59E0B", badge: "bg-yellow-400 text-yellow-900", label: "1°" },
  { bar: "#94A3B8", badge: "bg-slate-400 text-slate-900", label: "2°" },
  { bar: "#B45309", badge: "bg-amber-700 text-white", label: "3°" },
];

const REST_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
  "#A855F7",
];

export default function RankingChart({ data }: { data: RankingItem[] }) {
  const top = data.slice(0, 10);
  const maxPoints = Math.max(...top.map((i) => i.points), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pódio top 3 */}
      {data.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle>🏆 Pódio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center gap-4 h-48">
              {/* 2° lugar */}
              <PodiumColumn
                item={data[1]}
                position={1}
                maxPoints={maxPoints}
                heightPct={70}
              />
              {/* 1° lugar */}
              <PodiumColumn
                item={data[0]}
                position={0}
                maxPoints={maxPoints}
                heightPct={100}
              />
              {/* 3° lugar */}
              <PodiumColumn
                item={data[2]}
                position={2}
                maxPoints={maxPoints}
                heightPct={50}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barras top 10 */}
      <Card className={data.length < 3 ? "lg:col-span-2" : ""}>
        <CardHeader>
          <CardTitle>Top Apostadores — Pontos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {top.map((item, index) => {
              const pct = Math.round((item.points / maxPoints) * 100);
              const color =
                index < 3
                  ? PODIUM_COLORS[index].bar
                  : REST_COLORS[(index - 3) % REST_COLORS.length];
              return (
                <div key={item.user.id} className="flex items-center gap-3">
                  <span className="w-6 text-xs text-muted-foreground text-right shrink-0">
                    {index + 1}°
                  </span>
                  <UserAvatar
                    name={item.user.name}
                    image={item.user.image}
                    className="h-7 w-7 shrink-0"
                  />
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
                        {item.points}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PodiumColumn({
  item,
  position,
  heightPct,
}: {
  item: RankingItem;
  position: number;
  maxPoints: number;
  heightPct: number;
}) {
  const { bar, badge, label } = PODIUM_COLORS[position];
  return (
    <div className="flex flex-col items-center gap-1 w-24">
      <UserAvatar
        name={item.user.name}
        image={item.user.image}
        className="h-10 w-10"
      />
      <span className="text-xs font-semibold text-center truncate w-full">
        {item.user.name}
      </span>
      <span className="text-sm font-bold">{item.points} pts</span>
      <div
        className="w-full rounded-t-lg flex items-end justify-center pb-2"
        style={{ height: `${heightPct}%`, backgroundColor: bar }}
      >
        <span className={`text-xs font-bold px-1 rounded ${badge}`}>
          {label}
        </span>
      </div>
    </div>
  );
}
