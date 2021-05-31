export interface Ok<T> {
  ok: true;
  output: T;
}

export interface Err<Name extends string, Args extends unknown[]> {
  ok: false;
  name: Name;
  args: Args;
}

export type ParserResult<T, Name extends string, Args extends unknown[]> =
  | Ok<T>
  | Err<Name, Args>;

export function ok<T>(output: T): Ok<T> {
  return { ok: true, output };
}

export function err<Name extends string, Args extends unknown[]>(
  name: Name,
  args: Args
): { ok: false; name: Name; args: Args } {
  return { ok: false, name, args };
}

export interface SyncParser<
  Input,
  Output,
  Name extends string,
  Args extends unknown[]
> {
  (value: Input): ParserResult<Output, Name, Args>;
}

export interface AsyncParser<
  Input,
  Output,
  Name extends string,
  Args extends unknown[]
> {
  (value: Input): Promise<ParserResult<Output, Name, Args>>;
}

export type Parser<I, O, N extends string, A extends unknown[]> =
  | SyncParser<I, O, N, A>
  | AsyncParser<I, O, N, A>;

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

type NameOf<Ps> = Ps extends Parser<never, unknown, infer Name, unknown[]>
  ? Name
  : never;

type ArgsOf<Ps> = Ps extends Parser<never, unknown, string, infer Args>
  ? Args
  : never;

export function and<
  Parsers extends Parser<never, unknown, string, unknown[]>[]
>(
  ...validators: CheckParsers<Parsers>
): AsyncParser<
  FirstInput<Parsers>,
  LastOutput<Parsers>,
  NameOf<Parsers[number]>,
  ArgsOf<Parsers[number]>
> {
  if (validators.length === 0) {
    throw new TypeError("At least one validator is required.");
  }

  return async (value: FirstInput<Parsers>) => {
    let output = value;
    for (const validator of validators) {
      const result = await validator(output);
      if (result.ok) {
        output = result.output as never;
      } else {
        return result as Err<NameOf<Parsers[number]>, ArgsOf<Parsers[number]>>;
      }
    }

    return ok(output);
  };
}
