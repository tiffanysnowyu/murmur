import 'dotenv/config';

export default {
  expo: {
    name: 'murmur',
    slug: 'murmur',
    version: '1.0.0',
    orientation: 'portrait',
    // icon: './assets/images/icon.png',
    scheme: 'murmur',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.anonymous.murmurapp',
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
          // image: './assets/images/splash-icon.png',
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
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
        OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
        CLAUDE_API_KEY: process.env.EXPO_PUBLIC_CLAUDE_API_KEY,
    },
  },
};