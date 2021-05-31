import { schema, ValidationError } from "src/schema";

describe("schema", () => {
  it("returns an async parser function", async () => {
    const parser = schema({}, {});
    await expect(parser({})).resolves.toEqual({});
  });

  it("returns the final object if all validations pass", async () => {
    const parser = schema(
      {
        foo: () => ({ ok: true, output: "hello" })
      },
      {
        foo: {}
      }
    );

    await expect(parser({ foo: "a" })).resolves.toEqual({ foo: "hello" });
  });

  it("runs each parser", async () => {
    const parser = schema(
      {
        foo: () => ({ ok: true, output: "hello" }),
        bar: () => ({ ok: false, name: "dummy", args: [1, 2] }),
        bux: () => ({ ok: false, name: "foobar", args: [] })
      },
      {
        foo: {},
        bar: {
          dummy: (value, arg1, arg2) =>
            `Value: '${value}'; Args: ${arg1} ${arg2}`
        },
        bux: {
          foobar: "Failure!"
        }
      }
    );

    await expect(parser({})).rejects.toThrow(
      new ValidationError({
        bar: "Value: ''; Args: 1 2",
        bux: "Failure!"
      })
    );

    await expect(
      parser({ foo: "abc", bar: "bux", unrelated: "?" })
    ).rejects.toThrow(
      new ValidationError({
        bar: "Value: 'bux'; Args: 1 2",
        bux: "Failure!"
      })
    );
  });

  it("accepts async parsers", async () => {
    const parser = schema(
      {
        foo: async () => ({ ok: false, name: "bread", args: ["a", "b"] })
      },
      {
        foo: {
          bread: (value, arg1, arg2) => `Value: ${value}; Args: ${arg1} ${arg2}`
        }
      }
    );

    await expect(parser({ foo: "bar" })).rejects.toThrow(
      new ValidationError({
        foo: "Value: bar; Args: a b"
      })
    );
  });
});
