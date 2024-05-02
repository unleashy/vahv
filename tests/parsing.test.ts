import { describe, it, expect } from "vitest";
import {
  type AsyncParser,
  type SyncParser,
  ValidationError,
  and,
  err,
  ok,
  schema,
} from "../src";

describe("ok", () => {
  it("returns a successful ParserResult", () => {
    expect(ok("123")).toEqual({ ok: true, output: "123" });
  });
});

describe("err", () => {
  it("returns a failed ParserResult", () => {
    expect(err("abc", [1, 2, 3])).toEqual({
      ok: false,
      name: "abc",
      args: [1, 2, 3],
    });
  });
});

describe("and", () => {
  const parser1: SyncParser<string, string, "v1", []> = (value) =>
    value[0] === "a" ? ok(value) : err("v1", []);

  const parser2: AsyncParser<string, string, "v2", [number, number]> = (
    value,
  ) => Promise.resolve(value.length === 1 ? ok(value) : err("v2", [1, 2]));

  const composed = and(parser1, parser2);

  it("composes parsers", async () => {
    await expect(composed("")).resolves.toEqual(err("v1", []));
    await expect(composed("ab")).resolves.toEqual(err("v2", [1, 2]));
    await expect(composed("a")).resolves.toEqual(ok("a"));
  });

  it("fails with no arguments", () => {
    expect(() => and()).toThrowError(TypeError);
  });

  it("can be used in a schema", async () => {
    const theSchema = schema(
      {
        a: composed,
      },
      {
        a: {
          v1: "v1",
          v2: (value: string, ...args: number[]) =>
            `Value: ${value} Args: ${args.join(" ")}`,
        },
      },
    );

    await expect(theSchema({ a: "a" })).resolves.toEqual({ a: "a" });
    await expect(theSchema({ a: "" })).rejects.toThrow(
      new ValidationError({ a: "v1" }),
    );
    await expect(theSchema({ a: "ab" })).rejects.toEqual(
      new ValidationError({
        a: "Value: ab Args: 1 2",
      }),
    );
  });
});
