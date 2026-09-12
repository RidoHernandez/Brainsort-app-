const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Ensure Metro watches and resolves the packages/core workspace
config.watchFolders = [path.resolve(projectRoot, 'packages')];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(projectRoot, 'packages'),
];

module.exports = config;
