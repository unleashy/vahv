import { ok, Parser } from "./parsing";

export const trim: Parser<string, string, "trim", []> = value =>
  ok(value.trim());
