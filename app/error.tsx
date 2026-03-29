"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const styles = `
  @keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-2deg); }
    75% { transform: rotate(2deg); }
  }
  
  @keyframes pulse-card {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  }
  
  .shake {
    animation: shake 0.5s infinite;
  }
  
  .pulse-card {
    animation: pulse-card 1.5s infinite;
  }
`;

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  return (
    <>
      <style>{styles}</style>
      <div className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden">
        {/* Cartão vermelho animado */}
        <div className="absolute top-10 right-10 text-9xl shake opacity-20 pointer-events-none">
          🔴
        </div>

        <Card className="w-full max-w-md bg-red-50 dark:bg-red-950/20 border-red-600/50 relative z-10 pulse-card">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🔴</div>
            <CardTitle className="text-3xl font-bold text-red-600">
              Cartão Vermelho! ⚽
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Você foi expulso do jogo
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-base">Aconteceu um erro durante a partida! 😡</p>
            <p className="text-sm text-red-600 font-semibold">
              O árbitro viu tudo acontecer...
            </p>
            {error.message && (
              <details className="text-xs text-muted-foreground cursor-pointer bg-red-100 dark:bg-red-900/30 p-3 rounded">
                <summary className="font-semibold">📋 Ver lance</summary>
                <p className="mt-2 text-xs break-words">{error.message}</p>
              </details>
            )}
            <div className="flex justify-center gap-2 text-2xl pt-2">
              <span>⚽</span>
              <span>🏟️</span>
              <span>👨‍⚖️</span>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={reset}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                🟨 Tentar novamente
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1"
              >
                🏠 Voltar para casa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
