import { schema } from "src/schema";

describe("schema", () => {
  it("returns an async validator function", async () => {
    const validator = schema({}, {});
    expect(await validator({})).toEqual({});
  });

  it("runs validations", async () => {
    const validator = schema(
      {
        foo: () => ({ ok: true }),
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

    expect(await validator({})).toEqual({
      bar: "Value: ''; Args: 1 2",
      bux: "Failure!"
    });

    expect(await validator({ foo: "abc", bar: "bux", unrelated: "?" })).toEqual(
      {
        bar: "Value: 'bux'; Args: 1 2",
        bux: "Failure!"
      }
    );
  });

  it("accepts async validators", async () => {
    const validator = schema(
      {
        foo: async () => ({ ok: false, name: "bread", args: ["a", "b"] })
      },
      {
        foo: {
          bread: (value, arg1, arg2) => `Value: ${value}; Args: ${arg1} ${arg2}`
        }
      }
    );

    expect(await validator({ foo: "bar" })).toEqual({
      foo: "Value: bar; Args: a b"
    });
  });
});
