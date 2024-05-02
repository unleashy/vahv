import { it, expect } from "vitest";
import { type Parser, schema } from "../src";

export function itWorksWithSchema<
  Output,
  SuccessOutput extends Output,
  Name extends string,
  P extends Parser<string, Output, Name, unknown[]>,
>(
  parser: P,
  name: Name,
  successfulValue: string | { input: string; output: SuccessOutput },
  failingValue?: string,
): void {
  const theSchema = schema(
    {
      a: parser,
    },
    {
      a: {
        [name]: "foobar",
      } as { [x in Name]: "foobar" },
    },
  );

  it("succeeds within a schema", () => {
    const input =
      typeof successfulValue === "string"
        ? successfulValue
        : successfulValue.input;

    const output =
      typeof successfulValue === "object"
        ? successfulValue.output
        : successfulValue;

    expect(theSchema({ a: input })).toEqual({
      ok: true,
      output: {
        a: output,
      },
    });
  });

  if (failingValue) {
    it("fails within a schema", () => {
      expect(theSchema({ a: failingValue })).toEqual({
        ok: false,
        error: { a: "foobar" },
      });
    });
  }
}
