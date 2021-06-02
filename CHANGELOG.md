# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.2] - 2021-06-02

### Changed

- Fix wrong return type of `err`

## [0.3.1] - 2021-05-31

### Changed

- Improved typing for `and`; now message functions are properly typed

## [0.3.0] - 2021-05-31

### Added

- `ValidationError`, thrown when a validation error occurs.
- `Infer<S>` takes a `SchemaParser` and returns the final parsed structure.
- `trim` is a transformer that trims both ends of a given string.
- `defaultTo` is a transformer that applies a default value if necessary.

### Changed

- **BREAKING CHANGES:**
  - Vahv now uses a [parsing](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
    methodology rather than a validation one. Thus, there are many breaking
    changes.
  - `and` is now always async and can always take async
    parsers.
  - `Validator` and `AsyncValidator` have been renamed to `SyncParser` and
    `AsyncParser` respectively. `Parser` now refers to an union of `SyncParser`
    and `AsyncParser`.
  - `schema`’s returned function now returns the parsed contents of the given
    data object. If there is a validation error, it throws `ValidationError`.
  - The internal file structure has changed.
- The messages object may not be exhaustive with regard to the given parsers
  anymore, because then you'd need to give error messages for transformers. If
  an error message is missing, an error will be thrown at runtime.
- Development dependencies have been upgraded to their latest version.

### Removed

- **BREAKING CHANGE:** `asyncAnd` has been removed. Use `and` instead.

## [0.2.0] - 2020-10-06

### Added

- This CHANGELOG file.
- `asyncAnd`, a validator that can receive sync and async validators alike.
  Always returns an async validator.

### Changed

- `schema` now returns a `Promise`, resolving to a validation result.
- Validator functions can now return a Promise resolving to a validation result.
  These are async validators. Note that `and` can only receive sync validators;
  use `asyncAnd` to compose async validators.

## [0.1.0] - 2020-10-05

## Added

- Vahv itself! This is its first release.

[unreleased]: https://github.com/unleashy/vahv/compare/v0.3.0...HEAD
[0.3.0]: https://www.npmjs.com/package/vahv/v/0.3.0
[0.2.0]: https://www.npmjs.com/package/vahv/v/0.2.0
[0.1.0]: https://www.npmjs.com/package/vahv/v/0.1.0
