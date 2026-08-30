const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo root
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages (root node_modules first)
config.resolver.nodeModulesPaths = [
  path.resolve(monorepoRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

// 3. Force Metro to resolve a SINGLE singleton copy of react and react-native from the monorepo root
config.resolver.extraNodeModules = {
  react: path.resolve(monorepoRoot, 'node_modules/react'),
  'react-native': path.resolve(monorepoRoot, 'node_modules/react-native'),
  'react-dom': path.resolve(monorepoRoot, 'node_modules/react-dom'),
};

module.exports = config;
