import {
  and,
  AsyncParser,
  email,
  err,
  length,
  matches,
  maxLength,
  minLength,
  ok,
  Parser,
  required,
  SyncParser
} from "src/validator";
import { schema, ValidationError } from "src/schema";

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
      args: [1, 2, 3]
    });
  });
});

describe("and", () => {
  const parser1: SyncParser<string, string, "v1", []> = value =>
    value[0] === "a" ? ok(value) : err("v1", []);

  const parser2: AsyncParser<string, string, "v2", [number, number]> =
    async value => (value.length === 1 ? ok(value) : err("v2", [1, 2]));

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

    await expect(theSchema({ a: "a" })).resolves.toEqual({ a: "a" });
    await expect(theSchema({ a: "" })).rejects.toThrow(
      new ValidationError({ a: "v1" })
    );
    await expect(theSchema({ a: "ab" })).rejects.toEqual(
      new ValidationError({
        a: "Value: ab Args: 1 2"
      })
    );
  });
});

function itWorksWithSchema<
  Name extends string,
  P extends Parser<string, unknown, Name, unknown[]>
>(parser: P, name: Name, successfulValue: string, failingValue: string) {
  const theSchema = schema(
    {
      a: parser
    },
    {
      a: {
        [name]: "foobar"
      }
    }
  );

  it("succeeds within a schema", async () => {
    await expect(theSchema({ a: successfulValue })).resolves.toEqual({
      a: successfulValue
    });
  });

  it("fails within a schema", async () => {
    await expect(theSchema({ a: failingValue })).rejects.toThrow(
      new ValidationError({ a: "foobar" })
    );
  });
}

describe("required", () => {
  it("passes for non-empty strings", () => {
    expect(required("hello")).toEqual(ok("hello"));
    expect(required("")).toEqual(err("required", []));
  });

  itWorksWithSchema(required, "required", "a", "");
});

describe("minLength", () => {
  const parser = minLength(3);

  it("defines a minimum length", () => {
    expect(parser("abc")).toEqual(ok("abc"));
    expect(parser("abcdef")).toEqual(ok("abcdef"));
    expect(parser("a")).toEqual(err("minLength", [3]));
  });

  itWorksWithSchema(parser, "minLength", "abc", "");
});

describe("maxLength", () => {
  const parser = maxLength(3);

  it("defines a maximum length", () => {
    expect(parser("abc")).toEqual(ok("abc"));
    expect(parser("a")).toEqual(ok("a"));
    expect(parser("abcdef")).toEqual(err("maxLength", [3]));
  });

  itWorksWithSchema(parser, "maxLength", "a", "abcd");
});

describe("length", () => {
  const parser = length(3, 6);

  it("defines a minimum and maximum length at once", async () => {
    expect(await parser("abc")).toEqual(ok("abc"));
    expect(await parser("abcdef")).toEqual(ok("abcdef"));
    expect(await parser("abcd")).toEqual(ok("abcd"));
    expect(await parser("a")).toEqual(err("length", [3, 6]));
    expect(await parser("abcdefgh")).toEqual(err("length", [3, 6]));
  });

  itWorksWithSchema(parser, "length", "abcd", "a");
});

describe("matches", () => {
  const parser = matches(/bread/);

  it("defines a matching regex for the value", () => {
    expect(parser("bread")).toEqual(ok("bread"));
    expect(parser("waffles pancakes bread eggs")).toEqual(
      ok("waffles pancakes bread eggs")
    );
    expect(parser("bre")).toEqual(err("matches", [/bread/]));
  });

  itWorksWithSchema(parser, "matches", "bread", "nope");
});

describe("email", () => {
  it("defines a simple email parser", () => {
    expect(email("name@example.com")).toEqual(ok("name@example.com"));
    expect(email("what+ever @ yep.yep")).toEqual(ok("what+ever @ yep.yep"));
    expect(email("needs@domain")).toEqual(err("email", []));
    expect(email("needs-at-sign")).toEqual(err("email", []));
  });

  itWorksWithSchema(email, "email", "foo@bar.com", "1234");
});
