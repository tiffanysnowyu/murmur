import 'dotenv/config';

module.exports = {
  expo: {
    name: 'murmur',
    slug: 'murmur',
    version: '1.0.0', // Increase this for new app releases. It can be increased in any way.
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'murmur',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      buildNumber: '1', // Increase this by 1 for each new app release to the app store
      supportsTablet: true,
      bundleIdentifier: 'com.anonymous.murmurapp',
      icon: './assets/images/icon.png',
    },
    android: {
      adaptiveIcon: {
        // foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      // favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you share them.",
          cameraPermission: "The app accesses your camera to let you take photos."
        }
      ],
      [
        "expo-secure-store",
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
        CLAUDE_API_KEY: process.env.EXPO_PUBLIC_CLAUDE_API_KEY,
    },
  }

};