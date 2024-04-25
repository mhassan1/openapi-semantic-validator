const { execFileSync } = require('child_process')
const { cpSync, writeFileSync } = require('fs')

const { tempDir, buildDir } = execEnv

// this must always match the version of `swagger-editor` in `package.json`
const version = '3.18.2'

execFileSync('git', [
  'clone', 'https://github.com/swagger-api/swagger-editor.git',
  '-b', `v${version}`,
  '--depth', 1,
  tempDir
])

writeFileSync(`${buildDir}/package.json`, JSON.stringify({
  name: 'swagger-editor-git',
  version
}))

cpSync(`${tempDir}/src/plugins`, `${buildDir}/src/plugins`, { recursive: true })
