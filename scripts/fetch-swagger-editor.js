const { execFileSync } = require('child_process')
const { writeFile } = require('fs/promises')

const { buildDir } = execEnv

// this must always match the version of `_bundled.swagger-editor` in `package.json`
const version = '5.7.0'

const run = async () => {
  const resp = await fetch(`https://cdn.jsdelivr.net/npm/swagger-editor@${version}/dist/umd/apidom.worker.js`)
  const text = await resp.text()
  await writeFile(`${buildDir}/package.json`, JSON.stringify({
    name: 'swagger-editor-npm',
    version
  }))
  await writeFile(`${buildDir}/apidom.worker.js`, text)
}

run()
