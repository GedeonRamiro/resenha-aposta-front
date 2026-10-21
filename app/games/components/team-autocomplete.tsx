"use client";

import { useMemo, useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Team } from "@/lib/teams";

function TeamSuggestionAvatar({ team }: { team: Team }) {
  const initials = team.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (team.logoUrl) {
    return (
      <span
        aria-hidden
        className="size-6 shrink-0 rounded-full border bg-cover bg-center"
        style={{ backgroundImage: `url(${team.logoUrl})` }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="size-6 shrink-0 rounded-full border bg-muted text-[10px] font-semibold text-muted-foreground flex items-center justify-center"
    >
      {initials || "--"}
    </span>
  );
}

type TeamAutocompleteProps = {
  label: string;
  teams: Team[];
  value: string;
  onChange: (teamId: string) => void;
  excludedTeamId?: string;
  disabled?: boolean;
};

export function TeamAutocomplete({
  label,
  teams,
  value,
  onChange,
  excludedTeamId,
  disabled,
}: TeamAutocompleteProps) {
  // null = usuário ainda não digitou; exibe o nome do time já selecionado (modo edição).
  const [typedQuery, setTypedQuery] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const query =
    typedQuery ?? teams.find((team) => team.id === value)?.name ?? "";
  const setQuery = setTypedQuery;

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return teams
      .filter((team) => team.id !== excludedTeamId)
      .filter(
        (team) =>
          !normalizedQuery || team.name.toLowerCase().includes(normalizedQuery),
      )
      .slice(0, 8);
  }, [teams, query, excludedTeamId]);

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery);

    const normalizedQuery = nextQuery.trim().toLowerCase();
    const exactMatch = teams.find(
      (team) =>
        team.id !== excludedTeamId &&
        team.name.trim().toLowerCase() === normalizedQuery,
    );

    onChange(exactMatch?.id ?? "");
  }

  return (
    <FormItem>
      <FormLabel>
        {label}
        <span className="text-red-500"> *</span>
      </FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            placeholder="Digite para buscar time"
            disabled={disabled}
            value={query}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              setTimeout(() => setIsOpen(false), 100);
            }}
            onChange={(event) => handleQueryChange(event.target.value)}
          />

          {isOpen && suggestions.length > 0 && (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
              {suggestions.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery(team.name);
                    onChange(team.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <TeamSuggestionAvatar team={team} />
                    <span>{team.name}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
