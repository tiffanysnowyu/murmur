import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function SignInScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Murmur</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      
      <View style={styles.buttonContainer}>
        <Pressable 
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleSignIn}
        >
          <Text style={styles.buttonText}>Continue with Google</Text>
        </Pressable>
        
        {Platform.OS === 'ios' && (
          <Pressable 
            style={[styles.button, styles.appleButton]}
            onPress={handleAppleSignIn}
          >
            <Text style={[styles.buttonText, { color: '#000' }]}>Continue with Apple</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
