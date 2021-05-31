import { ok, Parser } from "./parsing";

export function defaultTo<T>(
  defaultValue: () => T
): Parser<string, string | T, "defaultTo", [() => T]> {
  return value => ok(value.length === 0 ? defaultValue() : value);
}

export const trim: Parser<string, string, "trim", []> = value =>
  ok(value.trim());
