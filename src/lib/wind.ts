export const COMPASS_DIRECTIONS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW"
] as const;

export type CompassDirection = (typeof COMPASS_DIRECTIONS)[number];

export function degreesToCompass(degrees: number): CompassDirection {
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return COMPASS_DIRECTIONS[index];
}

export function compassToDegrees(direction: string): number {
  const index = COMPASS_DIRECTIONS.indexOf(direction.toUpperCase() as CompassDirection);
  return index >= 0 ? index * 22.5 : Number.NaN;
}

export function angleDelta(a: number, b: number): number {
  const diff = Math.abs(((a - b + 540) % 360) - 180);
  return Number.isNaN(diff) ? 180 : diff;
}

export function nearestDirectionDelta(direction: string, targets: string[]): number {
  if (!targets.length) return 180;
  const degrees = compassToDegrees(direction);
  return Math.min(...targets.map((target) => angleDelta(degrees, compassToDegrees(target))));
}

export function directionLabel(direction: string) {
  return direction.toUpperCase();
}
