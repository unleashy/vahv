import { describe, it, expect } from "vitest";
import { schema, ok, err } from "../src";

describe("schema", () => {
  it("returns a parser function", () => {
    const parser = schema({}, {});
    expect(parser({})).toEqual({ ok: true, output: {} });
  });

  it("returns the final object if all validations pass", () => {
    const parser = schema(
      {
        foo: () => ok("hello"),
      },
      {
        foo: {},
      },
    );

    expect(parser({ foo: "a" })).toEqual({
      ok: true,
      output: { foo: "hello" },
    });
  });

  it("runs each parser", () => {
    const parser = schema(
      {
        foo: () => ok("hello"),
        bar: () => err("dummy", [1, 2]),
        bux: () => err("foobar", []),
      },
      {
        foo: {},
        bar: {
          dummy: (value, arg1, arg2) =>
            `Value: '${value}'; Args: ${String(arg1)} ${String(arg2)}`,
        },
        bux: {
          foobar: "Failure!",
        },
      },
    );

    expect(parser({})).toEqual({
      ok: false,
      error: {
        bar: "Value: ''; Args: 1 2",
        bux: "Failure!",
      },
    });

    expect(parser({ foo: "abc", bar: "bux", unrelated: "?" })).toEqual({
      ok: false,
      error: {
        bar: "Value: 'bux'; Args: 1 2",
        bux: "Failure!",
      },
    });
  });

  it("fails if an error message is not present", () => {
    const parser1 = schema(
      {
        foo: () => err("bar", []),
      },
      {},
    );

    const parser2 = schema(
      {
        abc: () => err("def", []),
      },
      {
        abc: {},
      },
    );

    expect(() => parser1({ foo: "" })).toThrow(
      /a message for the "bar" parser in the "foo" key is not present/i,
    );
    expect(() => parser2({ abc: "" })).toThrow(
      /a message for the "def" parser in the "abc" key is not present/i,
    );
  });
});
