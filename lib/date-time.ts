const LOCALE_PT_BR = "pt-BR";
const DISPLAY_TIME_ZONE = "America/Sao_Paulo";

type DateInput = string | number | Date;

function toValidDate(value: DateInput): Date | null {
  const parsed =
    value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function formatDateTimeBR(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "short",
    timeStyle: "short",
  },
): string {
  const parsed = toValidDate(value);

  if (!parsed) {
    return "-";
  }

  return parsed.toLocaleString(LOCALE_PT_BR, {
    ...options,
    timeZone: DISPLAY_TIME_ZONE,
  });
}

export function formatDateBR(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "short",
  },
): string {
  const parsed = toValidDate(value);

  if (!parsed) {
    return "-";
  }

  return parsed.toLocaleDateString(LOCALE_PT_BR, {
    ...options,
    timeZone: DISPLAY_TIME_ZONE,
  });
}
