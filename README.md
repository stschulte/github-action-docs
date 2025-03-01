# GitHub Actions docs

[![CI Status](https://github.com/stschulte/github-action-docs/workflows/CI/badge.svg)](https://github.com/stschulte/github-action-docs/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/stschulte/github-action-docs/graph/badge.svg?token=P43DANKS6I)](https://codecov.io/gh/stschulte/github-action-docs)
[![npm version](https://badge.fury.io/js/github-action-docs.svg)](https://badge.fury.io/js/github-action-docs)

Generate documentation with inputs and outputs from your `action.yml` file.

This project was inspired by [terraform-docs](https://terraform-docs.io/).

## Why do you want to use github-actions-docs

You develop GitHub actions. You define available inputs and outputs in your
`action.yml` file but since they are not immediatly available to your users,
you also want to document those in your `README.md` file.
However you want to automate this process, so you do not have to manually keep
your `README.md` in sync.

`github-actions-docs` will read your `actions.yml` and automatically generate
documentation out of it, optionally injecting those in an existing `README.md`
file.

This project was inspired by [terraform-docs](https://terraform-docs.io/).

## Install

Navigate to your repository that contains your GitHub action and
install `github-action-docs` as a development dependency:

```
npm install --save-dev github-action-docs
```

## Generate a README.md for your GitHub action

You can now automatically generate a README.md file from your `action.yml` file:

```
npx github-action-docs --output-file README.md --mode overwrite action.yml
```

You can also inject documentation to an existing `README.md` file. Ensure
you have markers in your `README.md`:

```markdown
Some existing text in your README.md. It will not be overwritten.

<!-- BEGIN_GITHUB_ACTION_DOCS -->
everything in here will be replaced
<!-- END_GITHUB_ACTION_DOCS -->

Some existing text in your README.md. It will not be overwritten.
```

Now run `github-action-docs` in `inject`  mode:

```
npx github-action-docs --output-file README.md --mode inject action.yml
```

In case you make use of prettier and/or linter, I recommend to disable it for
the automatic code block:

```markdown
Some existing text in your README.md. It will not be overwritten.

<!-- markdownlint-capture -->
<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
<!-- BEGIN_GITHUB_ACTION_DOCS -->
everything in here will be replaced
<!-- END_GITHUB_ACTION_DOCS -->
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

Some existing text in your README.md. It will not be overwritten.
```

You can also create a task in your `package.json`:

```json
{
    "name": "your-github-action",
    "scripts": {
        "gen-docs": "github-action-docs --output-file README.md --mode inject action.yml"
    }
}
```

And then simply execute `npm run gen-docs` to regenerate your documentation.

## Running test

In order to run tests locally, execute the following

```
npm ci
npm run test:coverage
```

If you get an `ERR_INSPECTOR_NOT_AVAILABLE` error, make sure your nodejs is compiled with
`inspector` support. Otherwise run `npm run test` to skip code coverage
