import { type AsyncParser, type SyncParser, and, err, ok } from "./parsing";

export const required: SyncParser<string, string, "required", []> = (value) =>
  value.length === 0 ? err("required", []) : ok(value);

export function minLength(
  length: number,
): SyncParser<string, string, "minLength", [number]> {
  return (value) =>
    value.length < length ? err("minLength", [length]) : ok(value);
}

export function maxLength(
  length: number,
): SyncParser<string, string, "maxLength", [number]> {
  return (value) =>
    value.length > length ? err("maxLength", [length]) : ok(value);
}

export function length(
  min: number,
  max: number,
): AsyncParser<string, string, "length", [number, number]> {
  const composed = and(minLength(min), maxLength(max));
  return async (value) => {
    let result = await composed(value);
    return result.ok ? ok(value) : err("length", [min, max]);
  };
}

export function matches(
  pattern: RegExp,
): SyncParser<string, string, "matches", [RegExp]> {
  return (value) =>
    pattern.test(value) ? ok(value) : err("matches", [pattern]);
}

const emailMatcher = matches(/^.+@.+\..+$/);
export const email: SyncParser<string, string, "email", []> = (value) =>
  emailMatcher(value).ok ? ok(value) : err("email", []);
