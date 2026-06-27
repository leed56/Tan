module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    // Equivalent to the `nativewind/babel` preset, but using reanimated 3's
    // babel plugin instead of `react-native-worklets/plugin` (which the bundled
    // css-interop preset hardcodes for reanimated 4 and isn't installed here).
    plugins: [
      require('react-native-css-interop/dist/babel-plugin').default,
      [
        '@babel/plugin-transform-react-jsx',
        { runtime: 'automatic', importSource: 'react-native-css-interop' },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
