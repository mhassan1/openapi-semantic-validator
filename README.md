# OpenAPI Semantic Validator

Perform semantic validation on an OpenAPI specification, just like Swagger Editor!

## Purpose

[Swagger Editor](https://editor.swagger.io/) performs both structural (schema) and semantic (spec) validation of OpenAPI specifications.
While [swagger-parser](https://www.npmjs.com/package/@apidevtools/swagger-parser) performs structural validation,
it does not (yet) support semantic validation:

> Note: Validating against the OpenAPI 3.0 Specification is not (yet) supported. For now, the validate.spec option is ignored if your API is in OpenAPI 3.0 format.
>
> -- [swagger-parser docs](https://apitools.dev/swagger-parser/docs/options.html#validate-options)

Once [swagger-parser](https://www.npmjs.com/package/@apidevtools/swagger-parser) adds support for semantic validation, this package will be deprecated.

This package performs semantic validation by executing the validators from the [swagger-editor](https://www.npmjs.com/package/swagger-editor) package.
It does not parse OpenAPI specifications or perform structural validation; use [swagger-parser](https://www.npmjs.com/package/@apidevtools/swagger-parser) for that.

### Validation Examples

#### Structural

NOTE: This package does not perform structural validation; use [swagger-parser](https://www.npmjs.com/package/@apidevtools/swagger-parser) for that.

* should have required property 'X'
* should NOT have additional properties
* etc.

#### Semantic

* Operations must have unique operationIds
* Path parameter "X" must have the corresponding {X} segment in the "Y" path
* etc.

## Installation

`yarn add openapi-semantic-validator`

## Usage

This package should be used alongside [swagger-parser](https://www.npmjs.com/package/@apidevtools/swagger-parser), which provides structural validation:

```js
const SwaggerParser = require('@apidevtools/swagger-parser')
const { validateOpenapiSemantics } = require('openapi-semantic-validator')

// parse and validate structure
const spec = await SwaggerParser.validate('openapi.yml')

// validate semantics
try {
  await validateOpenapiSemantics(spec)
  log('no semantic errors!')
} catch (err) {
  log(`semantic errors: ${JSON.stringify(err.semanticErrors)}`)
}
```

## API

- `validateOpenapiSemantics(spec)`
    - Validates an OpenAPI specification
    - Inputs:
        - `spec`: Parsed OpenAPI specification
    - Returns: `Promise`
        - If no semantic errors are found, resolves
        - If semantic errors are found, rejects with an `Error` object containing a `semanticErrors` property;
          this is an array of objects containing:
            - `level: 'error' | 'warning'`
            - `message: string`
            - `path: string[]`

## Development

```bash
yarn
yarn test
```

## License

MIT
