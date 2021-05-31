import { itWorksWithSchema } from "./helpers";
import { ok } from "../src/parsing";
import { defaultTo, trim } from "../src/builtin-transformers";

describe("defaultTo", () => {
  const parser = defaultTo(() => 123);

  it("applies a default", () => {
    expect(parser("")).toEqual(ok(123));
    expect(parser("999")).toEqual(ok("999"));
  });

  itWorksWithSchema(parser, "defaultTo", { input: "", output: 123 });
});

describe("trim", () => {
  it("trims the given string", () => {
    expect(trim(" abcd ")).toEqual(ok("abcd"));
  });

  itWorksWithSchema(trim, "trim", { input: " a ", output: "a" });
});
