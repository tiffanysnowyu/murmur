// app/onboarding.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { MainScreen, CtaButton } from '@/components/Common';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Screen Content Components
const MurmurScreenContent = () => (
  <View style={styles.content}>
    <View style={styles.titleContainer}>
      <Text style={styles.murmurTitle}>Murmur</Text>
    </View>
  </View>
);

const MurmurDetailsContent = () => (
  <View style={styles.content}>
    <Text style={styles.mainTitle}>Quiet clarity in a noisy world</Text>
    <Text style={styles.subtitle}>
      Murmur helps you understand what matters{'\n'}and leave the rest behind
    </Text>
  </View>
);

const HowItWorksContent = ({ onContinue }: { onContinue?: () => void }) => (
  <>
    <View style={styles.content}>
      <Text style={styles.title}>How it works</Text>
      <View style={styles.stepsContainer}>
        <Text style={styles.step}>1. Paste what worries you</Text>
        <Text style={styles.step}>2. We check the facts</Text>
        <Text style={styles.step}>3. Reset with guided breathing</Text>
      </View>
      <View style={styles.characterContainer}>
        <View style={styles.characterPlaceholder}>
          <View style={styles.characterHead} />
          <View style={styles.characterBody} />
          <View style={styles.characterArm} />
          <View style={styles.characterLeg} />
        </View>
      </View>
    </View>
    {onContinue && <CtaButton onPress={onContinue} buttonText="Continue" />}
  </>
);

// Animation Hook
const useOnboardingAnimation = () => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [showFinalButton, setShowFinalButton] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const screens = [
    { id: 'murmur', component: MurmurScreenContent },
    { id: 'details', component: MurmurDetailsContent },
    { id: 'howitworks', component: HowItWorksContent },
  ];

  useEffect(() => {
    if (currentScreenIndex >= screens.length) {
      return;
    }

    const timer = setTimeout(() => {
      if (currentScreenIndex < screens.length - 1) {
        // Fade out current screen
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          // Switch to next screen
          setCurrentScreenIndex(currentScreenIndex + 1);
          // Fade in next screen
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            // If this is the final screen, show the button
            if (currentScreenIndex + 1 === screens.length - 1) {
              setShowFinalButton(true);
            }
          });
        });
      }
    }, 3000); // 3 seconds between transitions

    return () => clearTimeout(timer);
  }, [currentScreenIndex, fadeAnim]);

  const handleContinue = () => {
    router.push('/chooseinput');
  };

  return {
    currentScreen: screens[currentScreenIndex],
    fadeAnim,
    showFinalButton,
    handleContinue,
  };
};

export default function OnboardingScreen() {
  const { currentScreen, fadeAnim, showFinalButton, handleContinue } = useOnboardingAnimation();

  if (!currentScreen) {
    return null;
  }

  const CurrentScreenComponent = currentScreen.component;
  const isHowItWorksScreen = currentScreen.id === 'howitworks';

  return (
    <MainScreen>
      <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
        <CurrentScreenComponent 
          onContinue={isHowItWorksScreen && showFinalButton ? handleContinue : undefined}
        />
      </Animated.View>
    </MainScreen>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  // Murmur Screen Styles
  titleContainer: {
    marginBottom: screenHeight * 0.3,
  },
  murmurTitle: {
    fontSize: 48,
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    color: '#4A90A4',
    textAlign: 'center',
  },
  // Murmur Details Styles
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
  // How It Works Styles
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