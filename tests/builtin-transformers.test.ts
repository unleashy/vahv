import { itWorksWithSchema } from "./helpers";
import { ok } from "../src/parsing";
import { trim } from "../src/builtin-transformers";

describe("trim", () => {
  it("trims the given string", () => {
    expect(trim(" abcd ")).toEqual(ok("abcd"));
  });

  itWorksWithSchema(trim, "trim", { input: " a ", output: "a" });
});
