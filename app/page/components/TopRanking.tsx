import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IUserScore } from "@/types/types";

const surfaceCardClassName =
  "border border-primary/25 bg-linear-to-b from-primary/8 via-card to-primary/4 shadow-[0_20px_55px_-44px_rgba(234,88,12,0.55)] ring-primary/20";

interface TopRankingProps {
  ranking: IUserScore[];
}

export default function TopRanking({ ranking }: TopRankingProps) {
  return (
    <Card className={surfaceCardClassName}>
      <CardHeader>
        <CardTitle>Top do ranking</CardTitle>
        <CardDescription>Quem esta liderando neste momento.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {ranking.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ranking ainda sem dados.
          </p>
        ) : (
          ranking.map((item, index) => (
            <Link key={item.user.id} href={`/user-scores/user/${item.user.id}`}>
              <div className="flex items-center justify-between rounded-[1.4rem] border border-primary/15 bg-background/90 p-4 transition-all hover:border-primary/30 hover:bg-background/95">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}o
                  </div>
                  <div>
                    <p className="font-medium">{item.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.bets} apostas registradas
                    </p>
                  </div>
                </div>
                <Badge className="rounded-full px-3 py-1">
                  {item.points} pts
                </Badge>
              </div>
            </Link>
          ))
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full border-primary/15">
          <Link href="/user-scores?period=geral">Ver ranking completo</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
