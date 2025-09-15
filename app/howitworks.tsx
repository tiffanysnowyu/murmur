// app/howitworks.tsx
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
import { BackButton, CtaButton } from '@/components/Common';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HowItWorks() {
  const handleContinue = () => {
    router.push('/chooseinput');
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
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <View style={styles.topNav}>
        <BackButton onPress={handleBack} buttonText={'Back'} />
      </View>

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>How it works</Text>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          <Text style={styles.step}>1. Paste what worries you</Text>
          <Text style={styles.step}>2. We check the facts</Text>
          <Text style={styles.step}>3. Reset with guided breathing</Text>
        </View>

        {/* Character Illustration Placeholder */}
        <View style={styles.characterContainer}>
          <View style={styles.characterPlaceholder}>
            <View style={styles.characterHead} />
            <View style={styles.characterBody} />
            <View style={styles.characterArm} />
            <View style={styles.characterLeg} />
          </View>
        </View>

        {/* Continue Button */}
        {/* <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            pressed && { opacity: 0.8 }
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable> */}
        <CtaButton onPress={handleContinue} buttonText="Continue" />
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 48,
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    color: '#4A90A4',
    textAlign: 'center',
    marginBottom: 60,
  },
  stepsContainer: {
    marginBottom: 80,
    alignItems: 'center',
  },
  step: {
    fontSize: 24,
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  characterContainer: {
    marginBottom: 80,
    alignItems: 'center',
  },
  characterPlaceholder: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  characterHead: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  characterBody: {
    width: 30,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  characterArm: {
    position: 'absolute',
    top: 45,
    left: 20,
    width: 20,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  characterLeg: {
    width: 6,
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
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
});