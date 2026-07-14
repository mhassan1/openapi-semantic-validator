import { readFileSync } from 'fs'
import { join } from 'path'
import { validateOpenapiSemantics, ErrorWithSemanticErrors } from '..'

const getSpec = (specName: string) =>
  JSON.parse(
    readFileSync(join(__dirname, 'fixtures', specName) + '.json').toString()
  )

test('validate openapi semantics (success)', async () => {
  await expect(validateOpenapiSemantics(getSpec('spec1'))).resolves.toBe(
    undefined
  )
})

test('validate openapi semantics (failure)', async () => {
  expect.assertions(2)

  try {
    await validateOpenapiSemantics(getSpec('spec2'))
  } catch (err) {
    expect((err as ErrorWithSemanticErrors).message).toMatch(
      'Semantic errors encountered!'
    )
    expect((err as ErrorWithSemanticErrors).semanticErrors).toEqual([
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

test('ensure spec is not mutated', async () => {
  const spec1 = getSpec('spec1')
  const specBefore = JSON.stringify(spec1)
  await validateOpenapiSemantics(spec1)
  const specAfter = JSON.stringify(spec1)
  expect(specBefore).toEqual(specAfter)
})
