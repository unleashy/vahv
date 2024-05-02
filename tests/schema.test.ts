import { describe, it, expect } from "vitest";
import { ValidationError, schema } from "../src";

describe("schema", () => {
  it("returns a parser function", () => {
    const parser = schema({}, {});
    expect(parser({})).toEqual({});
  });

  it("returns the final object if all validations pass", () => {
    const parser = schema(
      {
        foo: () => ({ ok: true, output: "hello" }),
      },
      {
        foo: {},
      },
    );

    expect(parser({ foo: "a" })).toEqual({ foo: "hello" });
  });

  it("runs each parser", () => {
    const parser = schema(
      {
        foo: () => ({ ok: true, output: "hello" }),
        bar: () => ({ ok: false, name: "dummy", args: [1, 2] }),
        bux: () => ({ ok: false, name: "foobar", args: [] }),
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

    expect(() => parser({})).toThrow(
      new ValidationError({
        bar: "Value: ''; Args: 1 2",
        bux: "Failure!",
      }),
    );

    expect(() => parser({ foo: "abc", bar: "bux", unrelated: "?" })).toThrow(
      new ValidationError({
        bar: "Value: 'bux'; Args: 1 2",
        bux: "Failure!",
      }),
    );
  });

  it("fails if an error message is not present", () => {
    const parser1 = schema(
      {
        foo: () => ({ ok: false, name: "bar", args: [] }),
      },
      {},
    );

    const parser2 = schema(
      {
        abc: () => ({ ok: false, name: "def", args: [] }),
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
