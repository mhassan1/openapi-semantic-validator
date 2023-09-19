const babel = require('@babel/core')
const klawSync = require('klaw-sync')
const { join, relative, dirname, resolve } = require('path')
const { readFileSync, writeFileSync, ensureDirSync, removeSync } = require('fs-extra')

const swaggerEditorPath = dirname(resolve(require.resolve('swagger-editor-git/package.json')))
const libDir = join(__dirname, '..', 'lib')
const swaggerEditor = 'swagger-editor'
const swaggerEditorlibDir = join(libDir, swaggerEditor)
const validateSemanticPath = join(swaggerEditorPath, 'src', 'plugins', 'validate-semantic')

const allFiles = klawSync(validateSemanticPath, { nodir: true })
  .map(({ path }) => path)
  .filter(path => path.endsWith('.js'))
  .concat(join(swaggerEditorPath, 'src', 'plugins', 'refs-util.js'))

removeSync(libDir)
ensureDirSync(libDir)
ensureDirSync(swaggerEditorlibDir)

for (const file of allFiles) {
  const relativeFile = relative(swaggerEditorPath, file)
  const { code: transformedCode } = babel.transformSync(readFileSync(file), {
    plugins: ['@babel/plugin-transform-modules-commonjs']
  })
  ensureDirSync(join(swaggerEditorlibDir, dirname(relativeFile)))
  writeFileSync(join(swaggerEditorlibDir, relativeFile), transformedCode)
}

const validatorFiles = allFiles
  .filter(file => relative(validateSemanticPath, file).startsWith('validators'))
  .map(file => join(swaggerEditor, relative(swaggerEditorPath, file)))

writeFileSync(
  join(libDir, 'validators.js'),
  `
const validatorFiles = ${JSON.stringify(validatorFiles, null, 2)}
const validators = {}
for (const validatorFile of validatorFiles) {
  Object.assign(validators, require('./' + validatorFile))
}
module.exports.validators = validators
`
)

writeFileSync(
  join(libDir, 'validators.d.ts'),
  `
type Validator = (node?: unknown) => (system: unknown) => unknown[] | Promise<unknown[]>
export const validators: Record<string, Validator>
`
)

writeFileSync(
  join(libDir, 'selectors.js'),
  `
module.exports.selectors = require('./swagger-editor/src/plugins/validate-semantic/selectors')
`
)

writeFileSync(
  join(libDir, 'selectors.d.ts'),
  `
type Selector =
  | ((state: undefined, node: unknown) => unknown)
  | ((state: undefined, node: unknown) => (system: unknown) => unknown)
  | (() => (system: unknown) => unknown)
export const selectors: Record<string, Selector>
`
)
