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
  V extends Validator<string, unknown[]>,
  T extends Record<string, V>
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
  ValidatorT extends Validator<Name, Args>,
  Schema extends Record<string, ValidatorT>,
  Messages extends MessagesRecord<ValidatorT, Schema>
>(
  validators: keyof Schema extends keyof Messages ? Schema : never,
  messages: Messages
): SchemaValidator<StringKeyof<Schema>> {
  return values => {
    const errors: Errors<StringKeyof<Schema>> = {};

    for (const [key, validator] of Object.entries(validators) as [
      StringKeyof<Schema>,
      ValidatorT
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