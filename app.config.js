import 'dotenv/config';

module.exports = {
  expo: {
    name: 'Murmur',
    slug: 'murmur',
    version: '1.0.1', // Increase this for new app releases. It can be increased in any way.
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'murmur',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      buildNumber: '9', // Increase this by 1 for each new app release to the app store it must be bigger than the last release number
      supportsTablet: false, // Set to false to exclude iPad from supported devices
      bundleIdentifier: 'com.anonymous.murmurapp',
      icon: './assets/images/icon.png',
      usesNonExemptEncryption: false, // Delete this if it causes problems with future releases
    },
    android: {
      adaptiveIcon: {
        // foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: "com.anonymous.murmurapp"
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
          // Alter these descriptions if the iOS store wants more or less detail about why we need photo library and camera permissions
          photosPermission: "The app uses your photo library to let you upload pictures of content you want to fact check for emotional reassurance rather than having to manually copy the text.",
          cameraPermission: "The app uses your camera to let you take pictures of content you want to fact check for emotional reassurance rather than having to manually copy the text.",
          microphonePermission: false,
        }
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
        CLAUDE_API_KEY: process.env.EXPO_PUBLIC_CLAUDE_API_KEY,
        eas: {
          projectId: "c97f7bcd-1bd6-4d1d-859a-0c4c1c55e1bc"
        }
    },
  }

};