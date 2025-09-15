// app/murmurdetails.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { BackButton, CtaButton, MainScreen } from '@/components/Common';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MurmurDetails() {
  const handleContinue = () => {
    router.push('/howitworks');
  };

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <MainScreen>
      {/* Back Button */}
      <View style={styles.topNav}>
        <BackButton onPress={handleBack} buttonText={'Back'} />
      </View>

      <View style={styles.content}>
        {/* Main Title */}
        <Text style={styles.mainTitle}>Quiet clarity in a noisy world</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Murmur helps you understand what matters{'\n'}and leave the rest behind
        </Text>
        
      </View>
      <CtaButton onPress={handleContinue} buttonText="Continue" />
    </MainScreen>
  );
}

const styles = StyleSheet.create({
  topNav: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  mainTitle: {
    fontSize: 32,
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    color: '#4A90A4',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 42,
    maxWidth: 320,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 120,
    lineHeight: 26,
    maxWidth: 300,
  },
});