const child_process = require('child_process')

const { buildDir } = execEnv

const version = '3.18.2'

child_process.execFileSync('git', [
  'clone', 'https://github.com/swagger-api/swagger-editor.git',
  '-b', `v${version}`,
  '--depth', 1,
  buildDir
])
