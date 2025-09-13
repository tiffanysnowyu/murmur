// app/murmurdetails.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MurmurDetails() {
  const handleContinue = () => {
    router.push('/howitworks');
  };

  const handleBack = () => {
    router.push('/murmurscreen');
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <View style={styles.topNav}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Main Title */}
        <Text style={styles.mainTitle}>Quiet clarity in a noisy world</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Murmur helps you understand what matters{'\n'}and leave the rest behind
        </Text>

        {/* Continue Button */}
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            pressed && { opacity: 0.8 }
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </View>

      {/* Bottom Navigation Icons */}
      <View style={styles.bottomNav}>
        <Pressable onPress={handleHome} style={styles.navButton}>
          <View style={styles.homeIcon} />
        </Pressable>
        <Pressable onPress={handleSkip} style={styles.navButton}>
          <View style={styles.skipIcon} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topNav: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 17,
    fontFamily: 'SF Pro Display',
    color: '#4A90A4',
    fontWeight: '400',
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
  continueButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: 345,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 34,
  },
  navButton: {
    padding: 16,
  },
  homeIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
  },
  skipIcon: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    borderRadius: 12,
  },
});