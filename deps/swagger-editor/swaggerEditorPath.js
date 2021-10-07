const { resolve, dirname } = require('path')

module.exports = dirname(resolve(require.resolve('swagger-editor/package.json')))
