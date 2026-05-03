import { addDays, format, isSaturday, isSunday, startOfDay } from "date-fns";

export function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function displayDay(date: Date) {
  return format(date, "EEE dd MMM");
}

export function displayHour(date: Date) {
  return format(date, "HH:mm");
}

export function isWeekendDate(date: Date) {
  return isSaturday(date) || isSunday(date);
}

export function nextSaturday(from = new Date()) {
  let cursor = startOfDay(from);
  for (let i = 0; i < 8; i += 1) {
    if (isSaturday(cursor)) return cursor;
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

export function nextWeekday(from = new Date()) {
  let cursor = addDays(startOfDay(from), 1);
  for (let i = 0; i < 7; i += 1) {
    if (!isWeekendDate(cursor)) return cursor;
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

export function parseDateInput(value?: string | null) {
  if (!value) return startOfDay(addDays(new Date(), 1));
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? startOfDay(addDays(new Date(), 1)) : parsed;
}

export function sameLocalDate(a: Date, b: Date) {
  return dateKey(a) === dateKey(b);
}
