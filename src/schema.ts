import type { AsyncValidator, Validator } from "./validator";

type Message<Args extends unknown[]> =
  | string
  | ((value: string, ...args: Args) => string);

type Unpromise<T> = T extends Promise<infer U> ? U : T;

type ValidatorName<
  T extends Validator<string, unknown[]> | AsyncValidator<string, unknown[]>
> = NonNullable<Unpromise<ReturnType<T>>["name"]>;

type ValidatorArgsByName<T, N extends string> = T extends unknown
  ? Unpromise<T> extends Validator<N, infer Args>
    ? Args
    : never
  : never;

type MessagesRecord<
  V extends Validator<string, unknown[]> | AsyncValidator<string, unknown[]>,
  T extends Record<string, V>
> = {
  [P in keyof T]: {
    [N in ValidatorName<T[P]>]: Message<ValidatorArgsByName<T[P], N>>;
  };
};

type Errors<Keys extends string> = Partial<Record<Keys, string>>;

type SchemaValidator<ValidatorsKeys extends string> = (
  values: Record<string, string | undefined>
) => Promise<Errors<ValidatorsKeys>>;

type StringKeyof<T> = keyof T extends string ? keyof T : never;

export function schema<
  Name extends string,
  Args extends unknown[],
  ValidatorT extends Validator<Name, Args> | AsyncValidator<Name, Args>,
  Schema extends Record<string, ValidatorT>,
  Messages extends MessagesRecord<ValidatorT, Schema>
>(
  validators: keyof Schema extends keyof Messages ? Schema : never,
  messages: Messages
): SchemaValidator<StringKeyof<Schema>> {
  return async values => {
    const allValidators = Object.entries(validators) as [
      StringKeyof<Schema>,
      ValidatorT
    ][];

    const results = await Promise.all(
      allValidators.map(([key, validator]) => validator(values[key] ?? ""))
    );

    const errors: Errors<StringKeyof<Schema>> = {};

    results.forEach((result, index) => {
      if (result.ok) return;

      const key = allValidators[index][0];

      // Unfortunately, TypeScript doesn't seem clever enough to detect the
      // types here correctly, so we're gonna have to go untyped—but that's ok,
      // because from the outside user’s perspective the types *are* correctly
      // checked, so this shouldn't cause much trouble.
      const message = (messages[key] as Record<string, Message<unknown[]>>)[
        result.name
      ];

      const value = values[key] ?? "";

      errors[key] =
        typeof message === "string" ? message : message(value, ...result.args);
    });

    return errors;
  };
}
