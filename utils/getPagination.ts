export function getPaginationRange(
  current: number,
  total: number,
  delta = 2,
): (number | string)[] {
  if (total <= 1) return [1];

  const range: (number | string)[] = [];
  const showLeftDots = current - delta > 2;
  const showRightDots = current + delta < total - 1;

  range.push(1); // sempre mostra a primeira página

  if (showLeftDots) range.push("...");

  const start = Math.max(2, current - delta);
  const end = Math.min(total - 1, current + delta);

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  if (showRightDots) range.push("...");

  if (total > 1) range.push(total); // sempre mostra a última página

  return range;
}
