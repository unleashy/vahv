import { schema } from "src/schema";

describe("schema", () => {
  it("returns an async validator function", () => {
    const validator = schema({}, {});
    expect(validator({})).toEqual({});
  });

  it("runs validations", () => {
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

    expect(validator({})).toEqual({
      bar: "Value: ''; Args: 1 2",
      bux: "Failure!"
    });

    expect(validator({ foo: "abc", bar: "bux", unrelated: "?" })).toEqual({
      bar: "Value: 'bux'; Args: 1 2",
      bux: "Failure!"
    });
  });
});
