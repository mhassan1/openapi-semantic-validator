import { readFileSync } from 'fs'
import { join } from 'path'
import { validateOpenapiSpec, ErrorWithValidationErrors } from '..'

const getSpec = (specName: string) =>
  readFileSync(join(__dirname, 'fixtures', specName) + '.json').toString()

test('validate openapi spec (success)', async () => {
  await expect(validateOpenapiSpec(getSpec('spec1'))).resolves.toBe(
    undefined
  )
})

test('validate openapi spec (failure)', async () => {
  expect.assertions(2)

  try {
    await validateOpenapiSpec(getSpec('spec2'))
  } catch (err) {
    expect((err as ErrorWithValidationErrors).message).toMatch(
      'Validation errors encountered!'
    )
    expect((err as ErrorWithValidationErrors).validationErrors).toEqual([
      {
        level: 'error',
        message: 'should always have a \'version\''
      },
      {
        level: 'error',
        message: 'Object includes not allowed fields'
      },
      {
        level: 'error',
        message: 'operationId\' must be unique among all operations'
      },
      {
        level: 'error',
        message:
          'parameter is not defined within path template'
      },
      {
        level: 'error',
        message:
          'operationId\' must be unique among all operations'
      },
      {
        level: 'warning',
        message:
          'Header Parameter named "Authorization" is ignored. Use the "securitySchemes" and "security" sections instead to define authorization'
      }
    ])
  }
})
