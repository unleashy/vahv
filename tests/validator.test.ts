import {
  and,
  asyncAnd,
  AsyncValidator,
  email,
  err,
  length,
  matches,
  maxLength,
  minLength,
  ok,
  required,
  Validator
} from "src/validator";
import { schema } from "src/schema";

describe("ok", () => {
  it("returns a successful ValidatorResult", () => {
    expect(ok()).toEqual({ ok: true });
  });
});

describe("err", () => {
  it("returns a failed ValidatorResult", () => {
    expect(err("abc", [1, 2, 3])).toEqual({
      ok: false,
      name: "abc",
      args: [1, 2, 3]
    });
  });
});

describe("and", () => {
  const validator1: Validator<"v1", []> = value =>
    value[0] === "a" ? ok() : err("v1", []);

  const validator2: Validator<"v2", [number, number]> = value =>
    value.length === 1 ? ok() : err("v2", [1, 2]);

  const composed = and(validator1, validator2);

  it("composes validators", () => {
    expect(composed("")).toEqual(err("v1", []));
    expect(composed("ab")).toEqual(err("v2", [1, 2]));
    expect(composed("a")).toEqual(ok());
  });

  it("fails with no arguments", () => {
    expect(() => and()).toThrowError(TypeError);
  });

  it("can be used in a schema", async () => {
    const theSchema = schema(
      {
        a: composed
      },
      {
        a: {
          v1: "v1",
          v2: (value: string, ...args: number[]) =>
            `Value: ${value} Args: ${args.join(" ")}`
        }
      }
    );

    expect(await theSchema({ a: "" })).toEqual({ a: "v1" });
    expect(await theSchema({ a: "ab" })).toEqual({ a: "Value: ab Args: 1 2" });
  });
});

describe("asyncAnd", () => {
  const validator1: Validator<"v1", []> = value =>
    value[0] === "a" ? ok() : err("v1", []);

  const validator2: AsyncValidator<"v2", [number, number]> = async value =>
    value.length === 1 ? ok() : err("v2", [1, 2]);

  const composed = asyncAnd(validator1, validator2);

  it("composes validators", async () => {
    expect(await composed("")).toEqual(err("v1", []));
    expect(await composed("ab")).toEqual(err("v2", [1, 2]));
    expect(await composed("a")).toEqual(ok());
  });

  it("fails with no arguments", () => {
    expect(() => asyncAnd()).toThrowError(TypeError);
  });

  it("can be used in a schema", async () => {
    const theSchema = schema(
      {
        a: composed
      },
      {
        a: {
          v1: "v1",
          v2: (value: string, ...args: number[]) =>
            `Value: ${value} Args: ${args.join(" ")}`
        }
      }
    );

    expect(await theSchema({ a: "" })).toEqual({ a: "v1" });
    expect(await theSchema({ a: "ab" })).toEqual({ a: "Value: ab Args: 1 2" });
  });
});

function itWorksWithSchema<
  Name extends string,
  Args extends unknown[],
  V extends Validator<Name, Args>
>(validator: V, name: Name, failingValue: string) {
  it("can be used in a schema", async () => {
    const theSchema = schema(
      {
        a: validator
      },
      {
        a: {
          [name]: "foobar"
        }
      }
    );

    expect(await theSchema({ a: failingValue })).toEqual({ a: "foobar" });
  });
}

describe("required", () => {
  it("passes for non-empty strings", () => {
    expect(required("hello")).toEqual(ok());
    expect(required("")).toEqual(err("required", []));
  });

  itWorksWithSchema(required, "required", "");
});

describe("minLength", () => {
  const validator = minLength(3);

  it("defines a minimum length", () => {
    expect(validator("abc")).toEqual(ok());
    expect(validator("abcdef")).toEqual(ok());
    expect(validator("a")).toEqual(err("minLength", [3]));
  });

  itWorksWithSchema(validator, "minLength", "");
});

describe("maxLength", () => {
  const validator = maxLength(3);

  it("defines a maximum length", () => {
    expect(validator("abc")).toEqual(ok());
    expect(validator("a")).toEqual(ok());
    expect(validator("abcdef")).toEqual(err("maxLength", [3]));
  });

  itWorksWithSchema(validator, "maxLength", "abcd");
});

describe("length", () => {
  const validator = length(3, 6);

  it("defines a minimum and maximum length at once", () => {
    expect(validator("abc")).toEqual(ok());
    expect(validator("abcdef")).toEqual(ok());
    expect(validator("abcd")).toEqual(ok());
    expect(validator("a")).toEqual(err("length", [3, 6]));
    expect(validator("abcdefgh")).toEqual(err("length", [3, 6]));
  });

  itWorksWithSchema(validator, "length", "a");
});

describe("matches", () => {
  const validator = matches(/bread/);

  it("defines a matching regex for the value", () => {
    expect(validator("bread")).toEqual(ok());
    expect(validator("waffles pancakes bread eggs")).toEqual(ok());
    expect(validator("bre")).toEqual(err("matches", [/bread/]));
  });

  itWorksWithSchema(validator, "matches", "nope");
});

describe("email", () => {
  it("defines a simple email validator", () => {
    expect(email("name@example.com")).toEqual(ok());
    expect(email("what+ever @ yep.yep")).toEqual(ok());
    expect(email("needs@domain")).toEqual(err("email", []));
    expect(email("needs-at-sign")).toEqual(err("email", []));
  });
});
