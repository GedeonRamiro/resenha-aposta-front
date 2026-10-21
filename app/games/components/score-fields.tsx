"use client";

import { Control } from "react-hook-form";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { GameFormValues } from "./game-form.schema";

type ScoreFieldName =
  | "homeScore"
  | "awayScore"
  | "secondLegHomeScore"
  | "secondLegAwayScore"
  | "penaltyHomeScore"
  | "penaltyAwayScore";

type ScoreVariant = "number" | "text";

type ScoreStepperInputProps = {
  value: number | string | undefined;
  disabled?: boolean;
  name: string;
  onBlur: () => void;
  onChange: (value: number | string | undefined) => void;
  inputRef: React.Ref<HTMLInputElement>;
  variant: ScoreVariant;
};

function ScoreStepperInput({
  value,
  disabled,
  name,
  onBlur,
  onChange,
  inputRef,
  variant,
}: ScoreStepperInputProps) {
  const currentValue =
    typeof value === "number"
      ? String(value)
      : typeof value === "string"
        ? value
        : "";

  const handleStep = (delta: number) => {
    const parsedValue = Number.parseInt(currentValue, 10);
    const safeValue =
      Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
    const nextValue = Math.max(safeValue + delta, 0);

    onChange(variant === "text" ? String(nextValue) : nextValue);
  };

  return (
    <div className="inline-flex items-stretch gap-1.5">
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={disabled}
        value={currentValue}
        onChange={(event) => {
          const nextValue = event.target.value.replace(/\D/g, "");

          if (variant === "text") {
            onChange(nextValue);
            return;
          }

          onChange(nextValue === "" ? undefined : Number(nextValue));
        }}
        onBlur={onBlur}
        name={name}
        ref={inputRef}
        className="h-11 w-12 rounded-lg px-1 text-center text-sm font-semibold tabular-nums"
      />

      <div className="flex flex-col overflow-hidden rounded-lg border border-input bg-background">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-5 w-5 rounded-none border-b border-input"
          aria-label="Aumentar placar"
          onClick={() => handleStep(1)}
        >
          <Plus className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-5 w-5 rounded-none"
          aria-label="Diminuir placar"
          onClick={() => handleStep(-1)}
        >
          <Minus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

type ScoreFieldProps = {
  control: Control<GameFormValues>;
  name: ScoreFieldName;
  variant: ScoreVariant;
  disabled?: boolean;
};

function ScoreField({ control, name, variant, disabled }: ScoreFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-0">
          <FormControl>
            <ScoreStepperInput
              value={field.value}
              disabled={disabled}
              name={field.name}
              onBlur={field.onBlur}
              inputRef={field.ref}
              variant={variant}
              onChange={(nextValue) =>
                field.onChange(
                  variant === "text"
                    ? nextValue === undefined
                      ? ""
                      : String(nextValue)
                    : nextValue === undefined
                      ? undefined
                      : Number(nextValue),
                )
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type ScorePhaseCardProps = {
  title: string;
  control: Control<GameFormValues>;
  homeName: ScoreFieldName;
  awayName: ScoreFieldName;
  variant?: ScoreVariant;
  disabled?: boolean;
};

export function ScorePhaseCard({
  title,
  control,
  homeName,
  awayName,
  variant = "number",
  disabled,
}: ScorePhaseCardProps) {
  const sides = [
    { label: "Casa", name: homeName },
    { label: "Visitante", name: awayName },
  ];

  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {sides.map(({ label, name }) => (
          <div key={name} className="space-y-1.5 text-center">
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
            <div className="flex justify-center">
              <ScoreField
                control={control}
                name={name}
                variant={variant}
                disabled={disabled}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
