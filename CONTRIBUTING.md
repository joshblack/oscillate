# Contributing

## Process

The project itself uses a combination of [ESLint](http://eslint.org/), [Jest](https://facebook.github.io/jest) and [Flow](flowtype.org) for linting, testing and type checking respectively.

You can run the following commands to execute each of the tasks:

- `yarn run lint`: To run our lint task
- `yarn run test`: To run our tests, add flags like `yarn run test -- --watch`
  for things like watch mode
- `yarn run flow`: To run Flow's type checker

Each of these tasks are run as part of CI, so make sure that they pass locally
in order to make sure any Pull Requests are ready to be accepted.

## Testing

Tests are run using `yarn run test`, and you can trigger the watch mode of Jest
by passing in the `--watch` flag like: `yarn run test -- --watch`.

The convention for tests in Jest are to include a `__tests__` subdirectory in
the folder of the file you're creating the test for. For example, if I have a
file in `src/foo.js`, then the corresponding test for `foo.js` would be in
`src/__tests__/foo-test.js`. Any file added in this kind of convention will be
picked up by Jest when running the task.

Jest itself uses a flavor of Jasmine for testing syntax. Typically, this is
more associated with the BDD style of testing and gives you keywords like
`describe` and `it`, and assertions like `expect(condition).toBe`.

In addition to these standard conventions for Jasmine, Jest also introduces
[Snapshot testing](https://facebook.github.io/jest/docs/snapshot-testing.html).

## Type Checking

The codebase for Spectrum is typed according to [Flow](flowtype.org). Most, if
not all, of the files should have a `/* @flow */` pragma at the top of it
indicating that Flow should be including that file in its analysis.

This kind of static analysis let's us verify the behavior of our system before
runtime, and also helps us document and catch any issues ahead of some end-user
discovering it in a product or feature.
