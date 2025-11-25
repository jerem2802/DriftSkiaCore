// metro.config.js à la racine de DriftSkiaCore
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
