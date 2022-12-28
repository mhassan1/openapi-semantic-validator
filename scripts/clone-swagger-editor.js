const child_process = require('child_process')

const { tempDir, buildDir } = execEnv

const version = '3.18.2'

child_process.execFileSync('git', [
  'clone', 'https://github.com/swagger-api/swagger-editor.git',
  '-b', `v${version}`,
  '--depth', 1,
  tempDir
])

child_process.execFileSync('cp', [`${tempDir}/package.json`, `${buildDir}/package.json`])
child_process.execFileSync('mkdir', ['-p', `${buildDir}/src/plugins`])
child_process.execFileSync('cp', ['-r', `${tempDir}/src/plugins`, `${buildDir}/src/.`])
