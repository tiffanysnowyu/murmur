import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

type GoogleUserInfo = {
  id: string;
  email: string;
  name: string;
  picture: string;
};

declare global {
  // Extend the global window interface to include Google
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
        };
      };
    };
  }
}

export const useAuth = () => {
  const { signIn } = useAuthContext();
  
  // Configure Google Sign-In
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'YOUR_GOOGLE_WEB_CLIENT_ID',
    iosClientId: 'YOUR_GOOGLE_IOS_CLIENT_ID',
    androidClientId: 'YOUR_GOOGLE_ANDROID_CLIENT_ID',
  });

  const signInWithGoogle = async () => {
    try {
      const result = await promptAsync();
      if (result?.type === 'success' && result.authentication) {
        // In a real app, you would verify the token with your backend
        // and get the user data. This is a simplified example.
        const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${result.authentication.accessToken}` },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user info from Google');
        }
        
        const userInfo = await response.json() as GoogleUserInfo;
        
        const userData = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          photo: userInfo.picture,
        };
        
        await signIn(userData);
        return userData;
      }
    } catch (error: unknown) {
      console.error('Google Sign-In Error:', error);
      if (error instanceof Error) {
        throw new Error(`Google Sign-In failed: ${error.message}`);
      }
      throw new Error('Google Sign-In failed with an unknown error');
    }
  };

  const signInWithApple = async () => {
    try {
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      // Here you would typically verify the credential with your backend
      // and get the user data
      const userData = {
        id: appleCredential.user,
        email: appleCredential.email,
        name: appleCredential.fullName ? 
          `${appleCredential.fullName.givenName} ${appleCredential.fullName.familyName}` : 
          undefined,
      };
      
      await signIn(userData);
      return userData;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_CANCELED') {
        // User canceled the sign-in
        console.log('User canceled Apple Sign In');
      } else {
        console.error('Apple Sign-In Error:', error);
      }
      
      if (error instanceof Error) {
        throw new Error(`Apple Sign-In failed: ${error.message}`);
      }
      throw new Error('Apple Sign-In failed with an unknown error');
    }
  };

  // Note: The signOut functionality is now handled by the AuthContext

  return {
    signInWithGoogle,
    signInWithApple,
  };
};
