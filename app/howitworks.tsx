// app/howitworks.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { BackButton, CtaButton, MainScreen } from '@/components/Common';

export default function HowItWorks() {
  const handleContinue = () => {
    router.push('/chooseinput');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <MainScreen>
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
});