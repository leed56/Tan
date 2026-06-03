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
    googleServicesFile: './GoogleService-Info.plist',
    infoPlist: {
      NSCameraUsageDescription: 'Used for profile photo upload.',
      NSPhotoLibraryUsageDescription: 'Used for profile photo selection.',
    },
    entitlements: {
      'com.apple.developer.applesignin': ['Default'],
      'com.apple.developer.devicecheck.appattest-environment': APP_ENV === 'production' ? 'production' : 'development',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A0E27',
    },
    package: env.bundleId,
    googleServicesFile: './google-services.json',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.VIBRATE',
      'android.permission.USE_BIOMETRIC',
      'android.permission.USE_FINGERPRINT',
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
    '@react-native-firebase/app',
    '@react-native-firebase/crashlytics',
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: '34.0.0',
          extraMavenRepos: [],
        },
        ios: {
          deploymentTarget: '15.1',
          useFrameworks: 'static',
        },
      },
    ],
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
