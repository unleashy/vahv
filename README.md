# Vahv

**Vahv** is a composable validation library focused on forms. It is easily
tree-shakeable and fully typed.

## Usage

First, you’ll want to create a schema by using the `schema` function:

```ts
import {
  schema,
  and,
  required,
  length,
  matches,
  trim,
  email,
  minLength,
} from "vahv";

const formSchema = schema(
  // Object schema
  {
    username: and(required, length(3, 32), matches(/^[A-Z0-9_-]+$/i), trim),
    email: and(required, email),
    password: and(required, minLength(8)),
  },
  // Error messages
  {
    username: {
      required: "Enter an username",
      length: (_, min, max) =>
        `Username must be between ${min} and ${max} characters`,
      matches: "Username must be in the correct format",
    },
    email: {
      required: "Enter an email address, like name@example.com",
      email: "Enter an email address, like name@example.com",
    },
    password: {
      required: "Enter a password",
      minLength: (_, length) =>
        `Password must have at least ${length} characters`,
    },
  },
);
```

You can then call the schema with an object to validate and transform it. It
either returns with the same object you passed in plus transformations, or
throws with a `ValidationError` with errors as per the second argument of
`schema`:

```ts
formSchema({});
// => throws: ValidationError {
//      username: "Enter an username",
//      email: "Enter an email address, like name@example.com",
//      password: "Enter a password"
//    }

formSchema({
  username: "ab",
  email: "name@example.com",
  password: "short",
});
// => throws: ValidationError {
//      username: "Username must be between 3 and 32 characters",
//      password: "Password must have at least 8 characters"
//    }

formSchema({
  username: "spa ces",
  email: "name@example.com",
  password: "longenoughsurely",
});
// => throws: ValidationError {
//      username: "Username must be in the correct format"
//    }

formSchema({
  username: "   niceperson123  ",
  email: "name@example.com",
  password: "  agoodpassword  ",
});
// => returns: {
//      username: "niceperson123",
//      email: "name@example.com",
//      password: "  agoodpassword  "
//    }
```

Each key in a schema has one parser. A parser validates and transforms its
input string. The result of a parser is a `ParserResult`, that can be either a
success with the transformed value through the `ok` function or a failure
through the `err` function. Many parsers—like Vahv’s built-in `length` parser—
take arguments; they just return a fresh parser bound to those arguments.

### Composing

Of course, you don’t want to limit yourself to just one parser. Therefore, Vahv
ships with a parser composer, `and`. Simply pass in as many parsers as you want,
and it’ll run each parser in sequence, and stop immediately as soon as a
failure happens.

### Reusing

Due to the compositional nature of Vahv, it’s really easy to reuse parsers.
For example, if you wanted to validate usernames across your application, just
do this:

```ts
// custom-parsers.ts
export const username = and(length(3, 32), matches(/^[A-Z0-9_-]$/i));

// ... wherever else ...
import { username } from 'custom-parsers.ts';


schema({
 username: username,
 ...
}, { ... });
```

This makes Vahv extremely easy to reuse. No more “extending”—just use what
TypeScript gives you. Also, if you want to make that username required, just
use `and`: `and(required, username)` 😊

### Error messages

Vahv intentionally separates error messages from validation. This makes it
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

schema({ ... }, defaultMessages);
```

Since the error message dictionary is a simple object, you can use object
spread to replace messages as needed with the above technique. Also note that
you get full typing support in the error message dictionary.

### Limitations

These limitations are intentional and will most likely not change.

- Vahv only deals with strings as input, because all input values from forms
  are strings. However, parsers may turn strings into other types; therefore,
  the output object may contain any type as values.
- `undefined` is transformed to an empty string.

## API

TODO

## Development

Vahv uses [pnpm](https://pnpm.io/) for development. Use `pnpm install` to
install all dependencies, `pnpm run test` to run all tests, and `pnpm lint` to
prettify and lint the codebase.

### Releasing

1. Edit CHANGELOG.md to document each change appropriately
2. Commit with message "vx.y.z"
3. `pnpm publish`
4. Push commits: `git push`
5. Push tag: `git push origin <vx.y.z>`

## License

[MIT.](LICENSE.txt)
