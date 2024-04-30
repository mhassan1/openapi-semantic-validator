const babel = require('@babel/core')
const klawSync = require('klaw-sync')
const { join, relative, dirname, resolve } = require('path')
const { readFileSync, writeFileSync, ensureDirSync, removeSync } = require('fs-extra')

const swaggerEditorPath = dirname(resolve(require.resolve('swagger-editor-git/package.json')))
const libDir = join(__dirname, '..', 'lib')
const swaggerEditor = 'swagger-editor'
const swaggerEditorLibDir = join(libDir, swaggerEditor)
const validateSemanticPath = join(
  swaggerEditorPath,
  'src',
  'plugins',
  'validate-semantic'
)

const swaggerEditorVersionActual =
  require(`${swaggerEditorPath}/package`).version
const swaggerEditorVersionExpected =
  require('../package')._bundled[swaggerEditor]

if (swaggerEditorVersionActual !== swaggerEditorVersionExpected) {
  throw new Error(
    'Mismatched `swagger-editor` version; the version in `clone-swagger-editor.js` must match `package.json`'
  )
}

const allFiles = klawSync(validateSemanticPath, { nodir: true })
  .map(({ path }) => path)
  .filter((path) => path.endsWith('.js'))
  .concat(join(swaggerEditorPath, 'src', 'plugins', 'refs-util.js'))

removeSync(libDir)
ensureDirSync(libDir)
ensureDirSync(swaggerEditorLibDir)

for (const file of allFiles) {
  const relativeFile = relative(swaggerEditorPath, file)
  const { code: transformedCode } = babel.transformSync(readFileSync(file), {
    plugins: ['@babel/plugin-transform-modules-commonjs']
  })
  ensureDirSync(join(swaggerEditorLibDir, dirname(relativeFile)))
  writeFileSync(join(swaggerEditorLibDir, relativeFile), transformedCode)
}

const validatorFiles = allFiles
  .filter((file) =>
    relative(validateSemanticPath, file).startsWith('validators')
  )
  .map((file) => join(swaggerEditor, relative(swaggerEditorPath, file)))

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

const refsPath = join(
  swaggerEditorLibDir,
  'src/plugins/validate-semantic/validators/2and3/refs.js'
)
const refs = readFileSync(refsPath).toString()
writeFileSync(
  refsPath,
  refs.replace('require("json-refs")', 'require("../../../../../../json-refs")')
)

ensureDirSync(join(libDir, 'json-refs'))
writeFileSync(
  join(libDir, 'json-refs/index.js'),
  `
// copied from https://github.com/whitlockjc/json-refs/blob/3371c1ee0eaf027314ebc321ac311c586f966dd4/index.js

var _ = require('lodash');

var badPtrTokenRegex = /~(?:[^01]|$)/g;

function pathFromPtr (ptr) {
  try {
    isPtr(ptr, true);
  } catch (err) {
    throw new Error('ptr must be a JSON Pointer: ' + err.message);
  }

  var segments = ptr.split('/');

  // Remove the first segment
  segments.shift();

  return decodePath(segments);
}

function isPtr (ptr, throwWithDetails) {
  var valid = true;
  var firstChar;

  try {
    if (_.isString(ptr)) {
      if (ptr !== '') {
        firstChar = ptr.charAt(0);

        if (['#', '/'].indexOf(firstChar) === -1) {
          throw new Error('ptr must start with a / or #/');
        } else if (firstChar === '#' && ptr !== '#' && ptr.charAt(1) !== '/') {
          throw new Error('ptr must start with a / or #/');
        } else if (ptr.match(badPtrTokenRegex)) {
          throw new Error('ptr has invalid token(s)');
        }
      }
    } else {
      throw new Error('ptr is not a String');
    }
  } catch (err) {
    if (throwWithDetails === true) {
      throw err;
    }

    valid = false;
  }

  return valid;
}

function decodePath (path) {
  if (!_.isArray(path)) {
    throw new TypeError('path must be an array');
  }

  return path.map(function (seg) {
    if (!_.isString(seg)) {
      seg = JSON.stringify(seg);
    }

    return seg.replace(/~1/g, '/').replace(/~0/g, '~');
  });
}
`
)
