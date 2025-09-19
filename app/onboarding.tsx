// app/onboarding.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { MainScreen, CtaButton } from '@/components/Common';

// Screen Content Components
const MurmurScreenContent = () => (
  <View style={styles.content}>
    <View style={styles.imageContainer}>
      <Image 
        source={require('../assets/images/gradient_text1.png')}
        style={styles.murmurImage}
        resizeMode="contain"
      />
    </View>
    <View style={styles.textContainer}>
    </View>
  </View>
);

const MurmurDetailsContent = () => (
  <View style={styles.content}>
    <View style={styles.imageContainer}>
      <Image 
        source={require('../assets/images/gradient_text2.png')}
        style={styles.murmurImage}
        resizeMode="contain"
      />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.subtitle}>
        Murmur helps you understand what matters{'\n'}and leave the rest behind
      </Text>
    </View>
  </View>
);

const HowItWorksContent = ({ onContinue }: { onContinue?: () => void }) => (
  <>
    <View style={styles.content}>
      <View style={styles.imageContainer}>
        <Image 
          source={require('../assets/images/gradient_text3.png')}
          style={styles.murmurImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.stepsContainer}>
        <View style={styles.stepsTextContainer}>
          <Text style={styles.step}>1. Paste what worries you</Text>
          <Text style={styles.step}>2. We check the facts</Text>
          <Text style={styles.step}>3. Reset with guided breathing</Text>
        </View>
        <View style={styles.buttonContainer}>
          {onContinue && <CtaButton onPress={onContinue} buttonText="Continue" />}
        </View>
      </View>
    </View>
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
      {/* <MurmurScreenContent /> */}
      {/* <MurmurDetailsContent /> */}
      {/* <HowItWorksContent onContinue={() => console.log('continue')}/> */}
      {/* <LinearTextGradient
        style={{ fontWeight: "bold", fontSize: 72 }}
        locations={[0, 1]}
        colors={["red", "blue"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        THIS IS TEXT GRADIENT
      </LinearTextGradient> */}
      {/* <MurmurScreenContent /> */}
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
    flex: 2,
    justifyContent: 'center',
  },
  // Murmur Screen Styles
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 72,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  murmurImage: {
    width: 345,
    height: 46,
  },
  // Murmur Details Styles
  mainTitle: {
    fontSize: 24,
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 36,
    letterSpacing: -0.264,
    maxWidth: 320,
  },
  subtitle: {
    color: '#595959',
    textAlign: 'center',
    fontFamily: 'SF Pro Display',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 27,
    letterSpacing: -0.198,
  },
  // How It Works Styles
  title: {
    fontSize: 24,
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 36,
    letterSpacing: -0.264,
  },
  stepsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stepsTextContainer: {
    alignItems: 'center',
  },
  buttonContainer: {
  },
  step: {  
    color: '#595959',
    textAlign: 'center',
    fontFamily: 'SF Pro Display',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 27,
    letterSpacing: -0.198,
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