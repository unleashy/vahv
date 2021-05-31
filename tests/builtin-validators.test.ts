import { err, ok, Parser } from "../src/parsing";
import { schema, ValidationError } from "../src/schema";
import {
  email,
  length,
  matches,
  maxLength,
  minLength,
  required
} from "../src/builtin-validators";

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
