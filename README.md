# OpenAPI Semantic Validator

Perform structural and semantic validation on an OpenAPI specification, just like Swagger Editor!

## Purpose

[Swagger Editor](https://editor.swagger.io/) performs both structural (schema) and semantic (spec) validation of OpenAPI specifications.

This package performs structural and semantic validation by executing the validators from the [swagger-editor](https://www.npmjs.com/package/swagger-editor) package.

### Validation Examples

#### Structural

* should always have a 'X'
* Object includes not allowed fields
* etc.

#### Semantic

* operationId' must be unique among all operations
* parameter is not defined within path template
* etc.

## Installation

`yarn add openapi-semantic-validator`

## Usage

```js
const { readFile } = require('fs/promises')
const { validateOpenapiSpec } = require('openapi-semantic-validator')

const spec = await readFile('openapi.yml', 'utf8')

// validate structure and semantics
try {
  await validateOpenapiSpec(spec)
  log('no structural or semantic errors!')
} catch (err) {
  log(`structural or semantic errors: ${JSON.stringify(err.validationErrors)}`)
}
```

## API

- `validateOpenapiSpec(spec)`
    - Validates an OpenAPI specification
    - Inputs:
        - `spec`: OpenAPI specification string
    - Returns: `Promise`
        - If no structural or semantic errors are found, resolves
        - If structural or semantic errors are found, rejects with an `Error` object containing a `validationErrors` property;
          this is an array of objects containing:
            - `level: 'error' | 'warning'`
            - `message: string`

## Development

```bash
yarn
yarn build
yarn test
```

## License

MIT
