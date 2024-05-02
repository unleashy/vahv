import type { Err, Ok, Parser, ParserResult, ParserError } from "./parsing";

export type Errors = Record<string, string>;

type GenericParser = Parser<never, unknown, string, unknown[]>;

type OutputOf<P> =
  P extends Parser<never, infer Output, string, unknown[]> ? Output : never;

export type SchemaResult<Schema extends Record<string, GenericParser>> = {
  [K in keyof Schema]: OutputOf<Schema[K]>;
};

export interface SchemaParser<Schema extends Record<string, GenericParser>> {
  (
    data: Record<string, string | undefined>,
  ): ParserResult<SchemaResult<Schema>, Errors>;
}

export type Infer<S> =
  S extends SchemaParser<infer Schema> ? SchemaResult<Schema> : never;

type ParserName<T> =
  T extends Parser<never, unknown, infer Name, unknown[]> ? Name : never;

type ParserArgsByName<P, Name extends string> =
  // prettier-ignore
  P extends Parser<never, unknown, Name, infer Args> ? Args : never;

export type Message<Args extends unknown[]> =
  | string
  | ((value: string, ...args: Args) => string);

export type Messages<Schema> = {
  [K in keyof Schema]?: {
    [N in ParserName<Schema[K]>]?: Message<ParserArgsByName<Schema[K], N>>;
  };
};

export function schema<
  Output,
  Name extends string,
  Args extends unknown[],
  ParserT extends Parser<string, Output, Name, Args>,
  Schema extends Record<string, ParserT>,
  Msgs extends Messages<Schema>,
>(parsers: Schema, messages: Msgs): SchemaParser<Schema> {
  return (data) => {
    const results = Object.entries(parsers).map(([key, parser]) => {
      const value = data[key] ?? "";
      const result = parser(value);
      return [key, value, result] as const;
    });

    const errors = results.filter((it) => !it[2].ok) as Array<
      [string, string, Err<ParserError<Name, Args>>]
    >;
    if (errors.length > 0) {
      const resolvedMessages = errors.map(([key, value, result]) => {
        const message = (
          messages[key] as Record<Name, Message<Args>> | undefined
        )?.[result.error.name];

        if (message === undefined) {
          throw new TypeError(
            `a message for the "${result.error.name}" parser in the "${key}" key is not present`,
          );
        }

        const finalMessage =
          typeof message === "string"
            ? message
            : message(value, ...result.error.args);

        return [key, finalMessage] as const;
      });

      const errorsObject = Object.fromEntries(resolvedMessages);
      return { ok: false, error: errorsObject };
    }

    const result = results.map(([key, , r]) => [key, (r as Ok<Output>).output]);
    return {
      ok: true,
      output: Object.fromEntries(result) as SchemaResult<Schema>,
    };
  };
}
