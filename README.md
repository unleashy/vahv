# Vahv

**Vahv** is a composable validation library focused on forms. It is easily
tree-shakeable and fully typed.

## Usage

First, you’ll want to create a _validator_ by using the `schema` function:

```ts
import { schema, and, required, length, matches, email, minLength } from "vahv";

const validator = schema(
  {
    username: and(required, length(3, 32), matches(/^[A-Z0-9_-]$/i)),
    email: and(required, email),
    password: and(required, minLength(8))
  },
  {
    username: {
      required: "Enter an username",
      length: (_, min, max) =>
        `Username must be between ${min} and ${max} characters`,
      matches: "Username must be in the correct format"
    },
    email: {
      required: "Enter an email address, like name@example.com",
      email: "Enter an email address, like name@example.com"
    },
    password: {
      required: "Enter a password",
      minLength: (_, length) =>
        `Password must have at least ${length} characters`
    }
  }
);
```

You can then call the validator function with an object to validate it, which
returns an errors object, with the same keys as your schema, with string values
representing the error messages you defined in the second argument of `schema`:

```ts
validator({});
// => { username: "Enter an username",
//      email: "Enter an email address, like name@example.com",
//      password: "Enter a password" }

validator({ username: "ab", email: "name@example.com", password: "short" });
// => { username: "Username must be between 3 and 32 characters",
//      password: "Password must have at least 8 characters" }

validator({
  username: "spa ces",
  email: "name@example.com",
  password: "longenoughsurely"
});
// => {}
```

When a key has been successfully validated, it doesn’t exist in the errors
object.

Each key in a schema has one validator. A validator is a function that takes in
a string, and returns a `ValidatorResult`, which can either be a success, with
the `ok` function or a failure with the `err` function. Many validators—like
Vahv’s built-in `length` validator—take arguments; they just return a validator
bound to those arguments.

### Composing

Of course, you don’t wanna limit yourself to one validator. Therefore, Vahv
ships with a validator composer, `and`. Simply pass in as many validators as
arguments as you want, and it’ll run each validator in sequence, and stop
immediately as soon as a validation error is returned.

### Reusing

Due to the compositional nature of Vahv, it’s really easy to reuse validators.
For example, if you wanted to validate usernames accross your application, just
do this:

```ts
// custom-validators.ts
export const username = and(length(3, 32), matches(/^[A-Z0-9_-]$/i));

// ... wherever else ...
import { username } from 'custom-validators.ts';

...

schema({
 username: username
 ...
}, { ... });
```

This makes Vahv extremely easy to reuse. No more “extending”—just use what
TypeScript gives you. Also, if you want to make that username required, just
use `and`: `and(required, username)` 😊

### Error messages

Vahv intentionally separates error messages from validators. This makes it
easier to reuse error messages, and decouples i18n from validation. If you have
a set of default messages, all you have to do is use what TypeScript already
gives you:

```ts
// validation-messages.ts
export default {
  username: {
    required: "Enter an username",
    length: (_, min, max) => `Username must be between ${min} and ${max} characters`
  },
  email: {
    ...
  },
  ...
};

// ... wherever else ...
import defaultMessages from 'validation-messages.ts';

...

schema({ ... }, defaultMessages);
```

Since the error message dictionary is a simple object, you can use object
spread to replace messages as needed with the above technique. Also note that
you get full typing support in the error message dictionary, and it will error
out if a message is missing!

### Limitations

Some of these limitations are intentional, but may be relaxed in a future
version:

- Vahv **only deals with strings**. This is because all input values from forms
  are strings.
- Vahv does not support asynchronous validators.
- `undefined` is transformed to an empty string.

## API

TODO

## Development

Vahv uses Yarn for development. Use `yarn install` to install all dependencies,
`yarn test` to run all tests, and `yarn lint` to prettify and lint the codebase.

## License

[MIT.](LICENSE.txt)
