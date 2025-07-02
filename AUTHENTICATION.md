# Authentication Setup Guide

This guide will help you set up Apple and Google authentication for your Murmur app.

## Google Sign-In Setup

1. **Create a Google Cloud Project**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the **Google Sign-In API** for your project

2. **Configure OAuth Consent Screen**
   - In the Google Cloud Console, go to **APIs & Services** > **OAuth consent screen**
   - Choose **External** user type and click **Create**
   - Fill in the required app information
   - Add the following scopes:
     - `email`
     - `profile`
   - Add your email as a test user

3. **Create OAuth 2.0 Client IDs**
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Create credentials for:
     - **Web application** (for web)
       - Add authorized JavaScript origins: `https://auth.expo.io`
       - Add authorized redirect URIs: `https://auth.expo.io/@your-username/your-app-slug`
     - **iOS** (for iOS)
       - Enter your iOS bundle ID: `com.anonymous.murmur`
     - **Android** (for Android)
       - Enter your package name: `com.anonymous.murmur`
       - Signing-certificate fingerprint: (see below for instructions)

4. **Update Configuration**
   - Open `app.json` and replace the following with your actual client IDs:
     - `YOUR_GOOGLE_WEB_CLIENT_ID`
     - `YOUR_GOOGLE_IOS_CLIENT_ID`
     - `YOUR_GOOGLE_ANDROID_CLIENT_ID`

## Apple Sign-In Setup (iOS only)

1. **Enable Sign In with Apple**
   - Go to the [Apple Developer Portal](https://developer.apple.com/account/)
   - Select your app identifier
   - Enable **Sign In with Apple** capability
   - Configure the Sign In with Apple service ID

2. **Update Xcode Project**
   - Open your project in Xcode
   - Go to **Signing & Capabilities**
   - Click **+ Capability** and add **Sign In with Apple**

3. **Configure App ID**
   - In the Apple Developer Portal, go to **Certificates, Identifiers & Profiles** > **Identifiers**
   - Select your app ID and enable **Sign In with Apple**
   - Configure the return URLs

## Environment Variables

Create a `.env` file in the root of your project with the following variables:

```env
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id
GOOGLE_ANDROID_CLIENT_ID=your_google_android_client_id
```

## Testing

1. **iOS**
   - Run on a physical device or iOS simulator
   - Make sure you're signed in with an Apple ID in the device settings

2. **Android**
   - Run on a physical device or emulator with Google Play Services
   - Make sure you're signed in with a Google account on the device

3. **Web**
   - Run `npx expo start --web`
   - Test in a browser with third-party cookies enabled

## Troubleshooting

- **Google Sign-In not working on web**
  - Make sure you've added `https://auth.expo.io` to authorized JavaScript origins
  - Check that the redirect URI is correctly configured

- **Apple Sign-In not working**
  - Verify that Sign In with Apple is enabled in your Apple Developer account
  - Check that the bundle ID matches exactly

- **Network errors**
  - Ensure you have a stable internet connection
  - Check that your app has the necessary network permissions

## Security Notes

- Never commit your actual client IDs to version control
- Use environment variables for sensitive information
- Set up proper security rules in your backend to validate tokens
- Regularly rotate your OAuth client secrets
