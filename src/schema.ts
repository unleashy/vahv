import type { Err, Ok, Parser } from "./parsing";

type Errors = Record<string, string>;

export class ValidationError extends Error {
  constructor(public readonly errors: Errors) {
    super();
  }
}

type GenericParser = Parser<never, unknown, string, unknown[]>;

type OutputOf<P> = P extends Parser<never, infer Output, string, unknown[]>
  ? Output
  : never;

type SchemaResult<Schema extends Record<string, GenericParser>> = {
  [K in keyof Schema]: OutputOf<Schema[K]>;
};

interface SchemaParser<Schema extends Record<string, GenericParser>> {
  (data: Record<string, string | undefined>): Promise<SchemaResult<Schema>>;
}

export type Infer<S> = S extends SchemaParser<infer Schema>
  ? SchemaResult<Schema>
  : never;

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type ParserName<T extends GenericParser> = NonNullable<
  UnwrapPromise<ReturnType<T>>["name"]
>;

type ParserArgsByName<T, N extends string> = T extends unknown
  ? UnwrapPromise<T> extends Parser<never, unknown, N, infer Args>
    ? Args
    : never
  : never;

type Message<Args extends unknown[]> =
  | string
  | ((value: string, ...args: Args) => string);

type MessagesRecord<P extends GenericParser, T extends Record<string, P>> = {
  [K in keyof T]?: {
    [N in ParserName<T[K]>]?: Message<ParserArgsByName<T[K], N>>;
  };
};

export function schema<
  Output,
  Name extends string,
  Args extends unknown[],
  ParserT extends Parser<never, Output, Name, Args>,
  Schema extends Record<string, ParserT>,
  Messages extends MessagesRecord<ParserT, Schema>
>(parsers: Schema, messages: Messages): SchemaParser<Schema> {
  return async data => {
    const parserEntries = Object.entries(parsers);
    const promises = parserEntries.map(([key, parser]) => {
      const value = data[key] ?? "";
      return Promise.resolve(parser(value as never)).then(
        result => [key, value, result] as [string, string, typeof result]
      );
    });

    const results = await Promise.all(promises);
    const errors = results.filter(it => it[2].ok === false) as [
      string,
      string,
      Err<Name, Args>
    ][];
    if (errors.length > 0) {
      const resolvedMessages = errors.map(([key, value, result]) => {
        const message = (
          messages[key] as Record<Name, Message<Args>> | undefined
        )?.[result.name];

        if (message === undefined) {
          throw new TypeError(
            `a message for the "${result.name}" parser in the "${key}" key is not present`
          );
        }

        const finalMessage =
          typeof message === "string"
            ? message
            : message(value, ...result.args);

        return [key, finalMessage];
      }) as [string, string][];

      const errorsObject = Object.fromEntries(resolvedMessages);
      throw new ValidationError(errorsObject);
    }

    const result = results.map(([key, , r]) => [key, (r as Ok<Output>).output]);
    return Object.fromEntries(result);
  };
}
