export type ValidatorResult<Name extends string, Args extends unknown[]> =
  | { ok: true; name?: Name; args?: Args }
  | { ok: false; name: Name; args: Args };

export function ok(): { ok: true } {
  return { ok: true };
}

export function err<Name extends string, Args extends unknown[]>(
  name: Name,
  args: Args
): { ok: false; name: Name; args: Args } {
  return { ok: false, name, args };
}

export type Validator<Name extends string, Args extends unknown[]> = (
  value: string
) => ValidatorResult<Name, Args>;

export function and<
  Name extends string,
  Args extends unknown[],
  Validators extends Validator<Name, Args>[]
>(...validators: Validators): Validators[number] {
  if (validators.length === 0) {
    throw new TypeError("At least one validator is required.");
  }

  return value => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.ok) return result;
    }

    return ok();
  };
}

export const required: Validator<"required", []> = value =>
  value.length === 0 ? err("required", []) : ok();

export function minLength(length: number): Validator<"minLength", [number]> {
  return value => (value.length < length ? err("minLength", [length]) : ok());
}

export function maxLength(length: number): Validator<"maxLength", [number]> {
  return value => (value.length > length ? err("maxLength", [length]) : ok());
}

export function length(
  min: number,
  max: number
): Validator<"length", [number, number]> {
  const composed = and(minLength(min), maxLength(max));
  return value => (composed(value).ok ? ok() : err("length", [min, max]));
}

export function matches(pattern: RegExp): Validator<"matches", [RegExp]> {
  return value => (pattern.test(value) ? ok() : err("matches", [pattern]));
}

const emailMatcher = matches(/^.+@.+\..+$/);
export const email: Validator<"email", []> = value =>
  emailMatcher(value).ok ? ok() : err("email", []);
