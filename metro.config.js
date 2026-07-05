const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// @react-native-firebase/* packages are native-only (Android/iOS modules with
// no web build) and are only ever reached via try/catch-guarded require()
// calls in src/services/{crashReporting,appCheck,phoneAuth}Service.ts, which
// already fall back gracefully when the module is unavailable. On native
// platforms, resolve normally. On web, skip resolving them at all — Metro
// would otherwise try to statically resolve their internal native dependency
// graph (e.g. crashlytics's own require of @react-native-firebase/app) and
// fail the whole bundle if that graph is incomplete on disk, which is a
// common failure mode on Windows due to node_modules path-length limits.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName.startsWith('@react-native-firebase/')) {
    return { type: 'empty' };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
