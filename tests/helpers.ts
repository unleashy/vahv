import { Parser } from "../src/parsing";
import { schema, ValidationError } from "../src/schema";

// eslint-disable-next-line jest/no-export
export function itWorksWithSchema<
  Name extends string,
  P extends Parser<string, unknown, Name, unknown[]>
>(
  parser: P,
  name: Name,
  successfulValue: string | { input: string; output: string },
  failingValue?: string
): void {
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
    const input =
      typeof successfulValue === "string"
        ? successfulValue
        : successfulValue.input;

    const output =
      typeof successfulValue === "string"
        ? successfulValue
        : successfulValue.output;

    await expect(theSchema({ a: input })).resolves.toEqual({
      a: output
    });
  });

  if (failingValue) {
    it("fails within a schema", async () => {
      await expect(theSchema({ a: failingValue })).rejects.toThrow(
        new ValidationError({ a: "foobar" })
      );
    });
  }
}
