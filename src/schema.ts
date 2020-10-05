import type { Validator } from "./validator";

type ValidatorName<T extends Validator<string, unknown[]>> = NonNullable<
  ReturnType<T>["name"]
>;

type ValidatorArgs<T extends Validator<string, unknown[]>> = NonNullable<
  ReturnType<T>["args"]
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Message<Args extends any[]> =
  | string
  | ((value: string, ...args: Args) => string);

type MessagesRecord<
  Name extends string,
  Args extends unknown[],
  T extends Record<string, Validator<Name, Args>>
> = {
  [P in keyof T]: Record<ValidatorName<T[P]>, Message<ValidatorArgs<T[P]>>>;
};

type Errors<Keys extends string> = Partial<Record<Keys, string>>;

type SchemaValidator<ValidatorsKeys extends string> = (
  values: Record<string, string | undefined>
) => Errors<ValidatorsKeys>;

type StringKeyof<T> = keyof T extends string ? keyof T : never;

export function schema<
  Name extends string,
  Args extends unknown[],
  Validators extends Record<string, Validator<Name, Args>>,
  Messages extends MessagesRecord<Name, Args, Validators>
>(
  validators: keyof Validators extends keyof Messages ? Validators : never,
  messages: Messages
): SchemaValidator<StringKeyof<Validators>> {
  return values => {
    const errors: Errors<StringKeyof<Validators>> = {};

    for (const [key, validator] of Object.entries(validators) as [
      StringKeyof<Validators>,
      Validator<Name, Args>
    ][]) {
      const value = values[key] ?? "";
      const result = validator(value);
      if (result.ok) continue;

      // Unfortunately, TypeScript doesn't seem clever enough to detect the
      // types here correctly, so we're gonna have to go untyped—but that's ok,
      // because from the outside user’s perspective the types *are* correctly
      // checked, so this shouldn't cause much trouble.
      const message = (messages[key] as Record<string, Message<unknown[]>>)[
        result.name
      ];

      errors[key] =
        typeof message === "string" ? message : message(value, ...result.args);
    }

    return errors;
  };
}
