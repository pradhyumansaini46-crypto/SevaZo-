const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const monorepoRootCandidate = path.resolve(projectRoot, '../..');
const isMonorepo =
  fs.existsSync(path.resolve(monorepoRootCandidate, 'package.json')) &&
  fs.existsSync(path.resolve(monorepoRootCandidate, 'packages'));

const monorepoRoot = isMonorepo ? monorepoRootCandidate : projectRoot;
const config = getDefaultConfig(projectRoot);

if (isMonorepo) {
  config.watchFolders = [monorepoRoot];
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
  ];
} else {
  config.watchFolders = [projectRoot];
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
  ];
}

module.exports = config;
