import { Card, CardContent } from "@/components/ui/card";
import { RankingItem } from "@/lib/user-scores";
import { Trophy, Target, TrendingUp, Users } from "lucide-react";

interface StatsCardsProps {
  data: RankingItem[];
}

export default function StatsCards({ data }: StatsCardsProps) {
  const totalBets = data.reduce((sum, i) => sum + i.bets, 0);
  const totalPoints = data.reduce((sum, i) => sum + i.points, 0);
  const avgHitRate =
    totalBets > 0 ? ((totalPoints / totalBets) * 100).toFixed(1) : "0";
  const leader = data[0];

  const stats = [
    {
      label: "Apostadores",
      value: data.length,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total de Apostas",
      value: totalBets,
      icon: Target,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Aproveitamento Médio",
      value: `${avgHitRate}%`,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Líder do Ranking",
      value: leader?.user.name ?? "—",
      sub: leader ? `${leader.points} pts` : undefined,
      icon: Trophy,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {s.label}
                </p>
                <p className="text-xl font-bold truncate">{s.value}</p>
                {s.sub && (
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
