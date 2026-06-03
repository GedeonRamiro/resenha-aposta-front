"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useBackendUser } from "@/lib/useBackendUser";
import {
  emitAppConfigUpdated,
  getConfig,
  RankingSeason,
  updateConfig,
} from "@/lib/config";
import TiTleSeparator from "@/components/TiTleSeparator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EditableSeason = RankingSeason & { id: string };

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createSeasonId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function SettingsPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useBackendUser();
  const [activeSection, setActiveSection] = useState<"minutes" | "seasons">(
    "minutes",
  );
  const [current, setCurrent] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [seasons, setSeasons] = useState<EditableSeason[]>([]);
  const [initialSeasons, setInitialSeasons] = useState<RankingSeason[]>([]);
  const [saving, setSaving] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) {
      router.replace("/");
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    getConfig()
      .then((config) => {
        setCurrent(config.betCloseMinutesBefore);
        setInputValue(String(config.betCloseMinutesBefore));
        const loadedSeasons = (config.rankingSeasons ?? []).map((season) => ({
          ...season,
          id: createSeasonId(),
        }));
        setSeasons(loadedSeasons);
        setInitialSeasons(config.rankingSeasons ?? []);
      })
      .catch(() => toast.error("Erro ao carregar configurações"));
  }, [isAdmin, isLoading, router]);

  if (isLoading || !isAdmin) return null;

  const parsedValue = parseInt(inputValue, 10);
  const isValid = !isNaN(parsedValue) && parsedValue >= 1;

  const serializedCurrentSeasons = JSON.stringify(
    seasons.map(({ id: _id, ...season }) => season),
  );
  const serializedInitialSeasons = JSON.stringify(initialSeasons);

  const hasChanges =
    isValid &&
    (parsedValue !== current ||
      serializedCurrentSeasons !== serializedInitialSeasons);

  const seasonsAreValid = seasons.every((season) => {
    return (
      season.label.trim().length > 0 &&
      season.slug.trim().length > 0 &&
      season.startDate.trim().length > 0 &&
      season.endDate.trim().length > 0 &&
      season.startDate <= season.endDate
    );
  });

  const canSave = hasChanges && seasonsAreValid;

  function addSeason() {
    setSeasons((currentSeasons) => [
      ...currentSeasons,
      {
        id: createSeasonId(),
        label: "",
        slug: "",
        startDate: "",
        endDate: "",
      },
    ]);
  }

  function removeSeason(id: string) {
    setSeasons((currentSeasons) => currentSeasons.filter((s) => s.id !== id));
  }

  function updateSeason(id: string, field: keyof RankingSeason, value: string) {
    setSeasons((currentSeasons) =>
      currentSeasons.map((season) => {
        if (season.id !== id) return season;

        if (field === "label") {
          const nextLabel = value;
          const currentSlug = season.slug.trim();
          const shouldAutoFillSlug =
            currentSlug.length === 0 || currentSlug === slugify(season.label);

          return {
            ...season,
            label: nextLabel,
            slug: shouldAutoFillSlug ? slugify(nextLabel) : season.slug,
          };
        }

        return {
          ...season,
          [field]: value,
        };
      }),
    );
  }

  async function handleSave() {
    if (!isValid || !seasonsAreValid || saving) return;

    const normalizedSeasons = seasons.map(({ id: _id, ...season }) => ({
      ...season,
      label: season.label.trim(),
      slug: season.slug.trim(),
      startDate: season.startDate,
      endDate: season.endDate,
    }));

    try {
      setSaving(true);
      const updated = await updateConfig({
        betCloseMinutesBefore: parsedValue,
        rankingSeasons: normalizedSeasons,
      });
      setCurrent(updated.betCloseMinutesBefore);
      setInputValue(String(updated.betCloseMinutesBefore));
      const updatedSeasons = (updated.rankingSeasons ?? []).map((season) => ({
        ...season,
        id: createSeasonId(),
      }));
      setSeasons(updatedSeasons);
      setInitialSeasons(updated.rankingSeasons ?? []);
      emitAppConfigUpdated();
      toast.success("Configurações salvas!");
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <TiTleSeparator title="Configurações" />
      <div className="flex justify-center mt-6">
        <Card className="w-full max-w-3xl shadow-xl">
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
              <Button
                type="button"
                size="sm"
                variant={activeSection === "minutes" ? "default" : "ghost"}
                onClick={() => setActiveSection("minutes")}
              >
                Minutos
              </Button>
              <Button
                type="button"
                size="sm"
                variant={activeSection === "seasons" ? "default" : "ghost"}
                onClick={() => setActiveSection("seasons")}
              >
                Temporadas
              </Button>
            </div>

            {activeSection === "minutes" && (
              <div className="rounded-xl border border-border p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Defina quantos minutos antes do jogo as apostas devem ser
                  fechadas automaticamente ao criar ou editar um jogo.
                </p>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="betCloseMinutes"
                  >
                    Fechar apostas com antecedência de (minutos)
                  </label>
                  <Input
                    id="betCloseMinutes"
                    type="number"
                    min={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={saving || current === null}
                    placeholder="Ex: 30"
                  />
                  {inputValue !== "" && !isValid && (
                    <p className="text-xs text-destructive">
                      Informe um número inteiro maior que 0.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeSection === "seasons" && (
              <div className="rounded-xl border border-border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Temporadas do ranking
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSeason}
                  >
                    Adicionar temporada
                  </Button>
                </div>

                {seasons.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhuma temporada cadastrada. O filtro "Geral" continuará
                    disponível.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {seasons.map((season) => (
                      <div
                        key={season.id}
                        className="rounded-lg border border-border p-3 space-y-3"
                      >
                        <div className="grid grid-cols-1 gap-3">
                          <Input
                            placeholder="Nome da temporada (ex: Junho)"
                            value={season.label}
                            onChange={(e) =>
                              updateSeason(season.id, "label", e.target.value)
                            }
                            disabled={saving}
                          />
                          <Input
                            placeholder="Slug (ex: junho-2026)"
                            value={season.slug}
                            onChange={(e) =>
                              updateSeason(season.id, "slug", e.target.value)
                            }
                            disabled={saving}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="date"
                              value={season.startDate}
                              onChange={(e) =>
                                updateSeason(
                                  season.id,
                                  "startDate",
                                  e.target.value,
                                )
                              }
                              disabled={saving}
                            />
                            <Input
                              type="date"
                              value={season.endDate}
                              onChange={(e) =>
                                updateSeason(
                                  season.id,
                                  "endDate",
                                  e.target.value,
                                )
                              }
                              disabled={saving}
                            />
                          </div>
                        </div>

                        {season.startDate &&
                          season.endDate &&
                          season.startDate > season.endDate && (
                            <p className="text-xs text-destructive">
                              A data inicial não pode ser maior que a data
                              final.
                            </p>
                          )}

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSeason(season.id)}
                            disabled={saving}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!seasonsAreValid && (
                  <p className="text-xs text-destructive">
                    Preencha nome, slug, início e fim de todas as temporadas.
                  </p>
                )}
              </div>
            )}

            <Button
              className="w-full"
              disabled={!canSave || saving}
              onClick={handleSave}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
