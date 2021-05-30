# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **BREAKING CHANGE:** Vahv now uses a
  [parsing](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
  methodology rather than a validation one. Thus, there are many breaking
  changes.

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

[Unreleased]: https://github.com/unleashy/vahv/compare/v0.2.0...HEAD
[0.2.0]: https://www.npmjs.com/package/vahv/v/0.2.0
[0.1.0]: https://www.npmjs.com/package/vahv/v/0.1.0
