export interface Ok<T> {
  ok: true;
  output: T;
}

export interface Err<E> {
  ok: false;
  error: E;
}

export type ParserResult<T, E> = Ok<T> | Err<E>;

export interface ParserError<Name extends string, Args extends unknown[]> {
  name: Name;
  args: Args;
}

export function ok<T>(output: T): Ok<T> {
  return { ok: true, output };
}

export function err<Name extends string, Args extends unknown[]>(
  name: Name,
  args: Args,
): Err<ParserError<Name, Args>> {
  return { ok: false, error: { name, args } };
}

export interface Parser<
  Input,
  Output,
  Name extends string,
  Args extends unknown[],
> {
  (value: Input): ParserResult<Output, ParserError<Name, Args>>;
}

type IsAssignable<A, B> = B extends A ? true : false;

type IsCompatible<P1, P2> =
  // prettier-ignore
  P1 extends Parser<never, infer O, string, unknown[]>
    ? P2 extends Parser<infer I, unknown, string, unknown[]>
      ? IsAssignable<I, O>
      : false
    : false;

type CheckCompatibility<Ps extends unknown[]> =
  // prettier-ignore
  Ps extends [infer P1, infer P2, ...infer Rest]
    ? [IsCompatible<P1, P2>, ...CheckCompatibility<[P2, ...Rest]>]
    : Ps["length"] extends 1
      ? [true]
      : [];

type AreAllTrue<T extends unknown[]> = T[number] extends true ? true : false;

type CheckParsers<Ps extends unknown[]> =
  // prettier-ignore
  true extends AreAllTrue<CheckCompatibility<Ps>> ? Ps : never;

type FirstInput<Ps> = Ps extends [infer F, ...unknown[]]
  ? F extends Parser<infer I, unknown, string, unknown[]>
    ? I
    : never
  : never;

type LastOutput<Ps> = Ps extends [...unknown[], infer L]
  ? L extends Parser<never, infer O, string, unknown[]>
    ? O
    : never
  : never;

type AndParser<Ps, FirstInput, LastOutput> =
  // prettier-ignore
  Ps extends Parser<never, unknown, infer Name, infer Args>
    ? Parser<FirstInput, LastOutput, Name, Args>
    : never;

export function and<
  Parsers extends Array<Parser<never, unknown, string, unknown[]>>,
>(
  ...validators: CheckParsers<Parsers>
): AndParser<Parsers[number], FirstInput<Parsers>, LastOutput<Parsers>> {
  if (validators.length === 0) {
    throw new TypeError("At least one validator is required.");
  }

  return ((value) => {
    let output = value;
    for (const validator of validators) {
      const result = validator(output);
      if (result.ok) {
        output = result.output as never;
      } else {
        return result;
      }
    }

    return ok(output);
  }) as AndParser<Parsers[number], FirstInput<Parsers>, LastOutput<Parsers>>;
}
