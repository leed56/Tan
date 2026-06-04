module.exports = function (api) {
  api.cache(true);
  const isWeb = api.caller((caller) => caller && caller.platform === 'web');
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // react-native-reanimated/plugin only needed for native builds
      ...(isWeb ? [] : ['react-native-reanimated/plugin']),
    ],
  };
};
