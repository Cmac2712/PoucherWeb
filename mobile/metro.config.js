const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '..')

const config = getDefaultConfig(projectRoot)

// Watch the shared/ directory for changes
config.watchFolders = [path.resolve(monorepoRoot, 'shared')]

// Resolve modules from both mobile/node_modules and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

module.exports = config
