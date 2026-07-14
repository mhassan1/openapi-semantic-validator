const { join, dirname, resolve } = require('path')
const { readFileSync, writeFileSync, ensureDirSync, removeSync } = require('fs-extra')

const swaggerEditorPath = dirname(resolve(require.resolve('swagger-editor-npm/package.json')))
const libDir = join(__dirname, '..', 'lib')
const swaggerEditor = 'swagger-editor'
const swaggerEditorLibDir = join(libDir, swaggerEditor)

const swaggerEditorVersionActual =
  require(`${swaggerEditorPath}/package`).version
const swaggerEditorVersionExpected =
  require('../package')._bundled[swaggerEditor]

if (swaggerEditorVersionActual !== swaggerEditorVersionExpected) {
  throw new Error(
    'Mismatched `swagger-editor` version; the version in `clone-swagger-editor.js` must match `_bundled.swagger-editor` in `package.json`'
  )
}

removeSync(libDir)
ensureDirSync(libDir)
ensureDirSync(swaggerEditorLibDir)

writeFileSync(
  join(swaggerEditorLibDir, 'apidom.worker.js'),
  `
${readFileSync(join(swaggerEditorPath, 'apidom.worker.js'))
    .toString()
    .replaceAll('self.onmessage=', 'selfOnmessage=')}
module.exports = apidomWorker
`
)

writeFileSync(
  join(swaggerEditorLibDir, 'index.js'),
  `
const { ApiDOMWorker } = require('./apidom.worker')

module.exports.doValidation = async content => {
  const worker = new ApiDOMWorker({
    getMirrorModels: () => [{
      uri: content,
      version: 0,
      getValue: () => content
    }]
  }, {})

  try {
    const diagnostics = await worker.doValidation(content)
    return diagnostics.map(diagnostic => ({
      message: diagnostic.message,
      severity: diagnostic.severity
    }))
  } finally {
    worker._languageService.terminate()
  }
}
`
)

writeFileSync(
  join(swaggerEditorLibDir, 'index.d.ts'),
  `
export type Diagnostic = {
  message: string
  severity: 1 | 2 | 3 | 4
}
export declare const doValidation: (content: string) => Promise<Diagnostic[]>;
`
)
