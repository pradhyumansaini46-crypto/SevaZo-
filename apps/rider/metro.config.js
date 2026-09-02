const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo root
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages (project local node_modules first, fallback to monorepo root)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Resolve single singleton instance of react, react-native, react-dom
function resolvePkg(name) {
  const local = path.resolve(projectRoot, 'node_modules', name);
  if (fs.existsSync(local)) return local;
  const root = path.resolve(monorepoRoot, 'node_modules', name);
  if (fs.existsSync(root)) return root;
  return local;
}

config.resolver.extraNodeModules = {
  react: resolvePkg('react'),
  'react-native': resolvePkg('react-native'),
  'react-dom': resolvePkg('react-dom'),
};

module.exports = config;
