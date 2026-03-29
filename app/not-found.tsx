import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const styles = `
  @keyframes bounceBall {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-30px) rotate(180deg); }
  }
  
  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100vw); }
  }
  
  .bounce-ball {
    animation: bounceBall 2s infinite;
  }
  
  .slide-ball {
    animation: slide 6s infinite;
  }
`;

export default function NotFound() {
  return (
    <>
      <style>{styles}</style>

      <div className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden">
        {/* Bola animada de fundo */}
        <div className="absolute top-20 left-0 text-6xl slide-ball pointer-events-none">
          ⚽
        </div>

        <Card className="w-full max-w-md border-red-600/30 relative z-10 shadow-2xl">
          <CardHeader className="text-center">
            <div className="text-7xl mb-4 bounce-ball inline-block">🥅</div>
            <CardTitle className="text-3xl font-bold">
              Gol marcado! 🎉
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Mas não nesta direção...
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-base">
              A página que você está procurando saiu do campo! ⚽
            </p>
            <p className="text-sm text-muted-foreground">
              Erroouu! 404 - Rota não encontrada
            </p>
            <div className="flex justify-center gap-2 text-2xl pt-2">
              <span>🏆</span>
              <span>⚽</span>
              <span>🏟️</span>
            </div>
            <Button
              asChild
              className="w-full mt-6 bg-orange-600 hover:bg-orange-700"
            >
              <Link href="/">⬅️ Voltar para o jogo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
