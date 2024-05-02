import { describe, it, expect } from "vitest";
import { type Parser, and, err, ok, schema } from "../src";

describe("ok", () => {
  it("returns a successful ParserResult", () => {
    expect(ok("123")).toEqual({ ok: true, output: "123" });
  });
});

describe("err", () => {
  it("returns a failed ParserResult", () => {
    expect(err("abc", [1, 2, 3])).toEqual({
      ok: false,
      error: {
        name: "abc",
        args: [1, 2, 3],
      },
    });
  });
});

describe("and", () => {
  const parser1: Parser<string, string, "v1", []> = (value) =>
    value[0] === "a" ? ok(value) : err("v1", []);

  const parser2: Parser<string, string, "v2", [number, number]> = (value) =>
    value.length === 1 ? ok(value) : err("v2", [1, 2]);

  const composed = and(parser1, parser2);

  it("composes parsers", () => {
    expect(composed("")).toEqual(err("v1", []));
    expect(composed("ab")).toEqual(err("v2", [1, 2]));
    expect(composed("a")).toEqual(ok("a"));
  });

  it("fails with no arguments", () => {
    expect(() => and()).toThrowError(TypeError);
  });

  it("can be used in a schema", () => {
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

    expect(theSchema({ a: "a" })).toEqual({ ok: true, output: { a: "a" } });
    expect(theSchema({ a: "" })).toEqual({ ok: false, error: { a: "v1" } });
    expect(theSchema({ a: "ab" })).toEqual({
      ok: false,
      error: {
        a: "Value: ab Args: 1 2",
      },
    });
  });
});
