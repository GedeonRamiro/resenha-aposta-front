import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatar } from "@/components/UserAvatar";
import { RankingItem } from "@/lib/user-scores";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingTable({ data }: { data: RankingItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabela de Classificação</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Pos.</TableHead>
              <TableHead>Apostador</TableHead>
              <TableHead className="text-center">Pontos</TableHead>
              <TableHead className="text-center">Apostas</TableHead>
              <TableHead className="text-center">Aproveitamento</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const hitRate =
                item.bets > 0
                  ? ((item.points / item.bets) * 100).toFixed(0)
                  : "0";
              const hitRateNum = Number(hitRate);

              return (
                <TableRow key={item.user.id}>
                  <TableCell className="font-medium">
                    {index < 3 ? (
                      <span className="text-lg">{MEDALS[index]}</span>
                    ) : (
                      <span className="text-muted-foreground">
                        {index + 1}°
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={item.user.name}
                        image={item.user.image}
                        className="h-9 w-9"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">
                          {item.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {item.user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge>{item.points}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{item.bets}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        hitRateNum >= 60
                          ? "text-green-600 font-medium"
                          : hitRateNum >= 40
                            ? "text-yellow-600 font-medium"
                            : "text-red-600 font-medium"
                      }
                    >
                      {hitRate}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/user-scores/user/${item.user.id}`}>
                        Detalhar
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
