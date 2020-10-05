export type ValidatorResult<Name extends string, Args extends unknown[]> =
  | { ok: true; name?: Name; args?: Args }
  | { ok: false; name: Name; args: Args };

export type Validator<Name extends string, Args extends unknown[]> = (
  value: string
) => ValidatorResult<Name, Args>;
