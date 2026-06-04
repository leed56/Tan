import type { ExpoConfig, ConfigContext } from 'expo/config';

const APP_ENV = process.env.APP_ENV ?? 'development';

const envConfig = {
  development: {
    name: 'Soma AI (Dev)',
    bundleId: 'com.somaaiedu.app.dev',
    icon: './assets/icon.png',
    appCheckDebugToken: process.env.EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN ?? '',
  },
  staging: {
    name: 'Soma AI (Staging)',
    bundleId: 'com.somaaiedu.app.staging',
    icon: './assets/icon.png',
    appCheckDebugToken: '',
  },
  production: {
    name: 'Soma AI',
    bundleId: 'com.somaaiedu.app',
    icon: './assets/icon.png',
    appCheckDebugToken: '',
  },
} as const;

const env = envConfig[APP_ENV as keyof typeof envConfig] ?? envConfig.development;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: env.name,
  slug: 'soma-ai',
  version: '1.0.0',
  orientation: 'portrait',
  icon: env.icon,
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0E27',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: env.bundleId,
    infoPlist: {
      NSCameraUsageDescription: 'Used for profile photo upload.',
      NSPhotoLibraryUsageDescription: 'Used for profile photo selection.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A0E27',
    },
    package: env.bundleId,
    permissions: [
      'android.permission.INTERNET',
      'android.permission.VIBRATE',
    ],
    versionCode: 1,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0A0E27',
        image: './assets/splash.png',
        resizeMode: 'contain',
      },
    ],
    // Note: @react-native-firebase/app, crashlytics, expo-build-properties
    // are added here only for production EAS builds (not needed for Expo Go).
  ],
  extra: {
    appEnv: APP_ENV,
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? 'REPLACE_WITH_EAS_PROJECT_ID',
    },
  },
  owner: 'somaaiedu',
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: `https://u.expo.dev/${process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? 'REPLACE_WITH_EAS_PROJECT_ID'}`,
    enabled: APP_ENV === 'production',
    fallbackToCacheTimeout: 0,
  },
});
