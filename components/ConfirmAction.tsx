"use client";

import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/api-base-url";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  id: string | number;
  endpoint: string;
  title?: string;
  description?: string;
  method?: "DELETE" | "POST" | "PATCH";
  successRedirectTo?: string;
}

export function ConfirmAction({
  id,
  endpoint,
  title = "Tem certeza?",
  description = "Essa ação não pode ser desfeita.",
  method = "DELETE",
  successRedirectTo,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRefreshing, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {};

    if (typeof window === "undefined") {
      return headers;
    }

    const token = window.localStorage.getItem("backendAuthToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async function getErrorMessageFromResponse(res: Response) {
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const payload = await res.json().catch(() => null);

      if (payload && typeof payload === "object") {
        const maybeMessage = (payload as { message?: unknown }).message;

        if (Array.isArray(maybeMessage)) {
          return maybeMessage.join(" ");
        }

        if (typeof maybeMessage === "string" && maybeMessage.trim()) {
          return maybeMessage;
        }
      }
    }

    const text = await res.text().catch(() => "");
    return text || "Erro ao executar ação";
  }

  async function handleAction(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (loading) return;

    try {
      setLoading(true);
      const apiBaseUrl = getApiBaseUrl();

      const res = await fetch(`${apiBaseUrl}${endpoint}/${id}`, {
        method,
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const details = await getErrorMessageFromResponse(res);
        throw new Error(details);
      }

      toast.success("Ação realizada com sucesso");

      setOpen(false);
      startTransition(() => {
        if (successRedirectTo) {
          router.push(successRedirectTo);
          return;
        }

        router.refresh();
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao executar ação",
      );
    } finally {
      setLoading(false);
    }
  }

  const isBusy = loading || isRefreshing;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => !isBusy && setOpen(nextOpen)}
    >
      <AlertDialogTrigger asChild>
        <Button variant="link" disabled={isBusy}>
          Excluir
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleAction} disabled={isBusy}>
            {isBusy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {loading ? "Excluindo..." : "Atualizando..."}
              </>
            ) : (
              "Confirmar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
