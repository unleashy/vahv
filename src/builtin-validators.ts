import { type Parser, and, err, ok } from "./parsing";

export const required: Parser<string, string, "required", []> = (value) =>
  value.length === 0 ? err("required", []) : ok(value);

export function minLength(
  length: number,
): Parser<string, string, "minLength", [number]> {
  return (value) =>
    value.length < length ? err("minLength", [length]) : ok(value);
}

export function maxLength(
  length: number,
): Parser<string, string, "maxLength", [number]> {
  return (value) =>
    value.length > length ? err("maxLength", [length]) : ok(value);
}

export function length(
  min: number,
  max: number,
): Parser<string, string, "length", [number, number]> {
  const composed = and(minLength(min), maxLength(max));
  return (value) => {
    let result = composed(value);
    return result.ok ? ok(value) : err("length", [min, max]);
  };
}

export function matches(
  pattern: RegExp,
): Parser<string, string, "matches", [RegExp]> {
  return (value) =>
    pattern.test(value) ? ok(value) : err("matches", [pattern]);
}

const emailMatcher = matches(/^.+@.+\..+$/);
export const email: Parser<string, string, "email", []> = (value) =>
  emailMatcher(value).ok ? ok(value) : err("email", []);
