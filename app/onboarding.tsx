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

const MurmurDetailsContent = ({ imageOpacity, textOpacity }: { imageOpacity?: any; textOpacity?: any }) => (
  <View style={styles.content}>
    <Animated.View style={[styles.imageContainer, { opacity: imageOpacity || 1 }]}>
      <Image 
        source={require('../assets/images/gradient_text2.png')}
        style={styles.murmurImage}
        resizeMode="contain"
      />
    </Animated.View>
    <Animated.View style={[styles.textContainer, { opacity: textOpacity || 1 }]}>
      <Text style={styles.subtitle}>
        Murmur helps you understand what matters{'\n'}and leave the rest behind
      </Text>
    </Animated.View>
  </View>
);

const HowItWorksContent = ({ onContinue, imageOpacity, stepsOpacity }: { onContinue?: () => void; imageOpacity?: any; stepsOpacity?: any }) => (
  <>
    <View style={styles.content}>
      <Animated.View style={[styles.imageContainer, { opacity: imageOpacity || 1 }]}>
        <Image 
          source={require('../assets/images/gradient_text3.png')}
          style={styles.murmurImage}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={[styles.stepsContainer, { opacity: stepsOpacity || 1 }]}>
        <View style={styles.stepsTextContainer}>
          <Text style={styles.step}>1. Paste what worries you</Text>
          <Text style={styles.step}>2. We check the facts</Text>
          <Text style={styles.step}>3. Reset with guided breathing</Text>
        </View>
        <View style={styles.buttonContainer}>
          {onContinue && <CtaButton onPress={onContinue} buttonText="Continue" />}
        </View>
      </Animated.View>
    </View>
  </>
);

// Animation Hook
const useOnboardingAnimation = () => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [showFinalButton, setShowFinalButton] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const detailsImageOpacity = useRef(new Animated.Value(0)).current;
  const detailsTextOpacity = useRef(new Animated.Value(0)).current;
  const howItWorksImageOpacity = useRef(new Animated.Value(0)).current;
  const howItWorksStepsOpacity = useRef(new Animated.Value(0)).current;

  const screens = [
    { id: 'murmur', component: MurmurScreenContent },
    { id: 'details', component: MurmurDetailsContent },
    { id: 'howitworks', component: HowItWorksContent },
  ];

  useEffect(() => {
    // Initial fade-in for the first screen
    if (currentScreenIndex === 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    }

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
          
          // Special animation for details screen
          if (currentScreenIndex + 1 === 1) { // Details screen is index 1
            // Reset details animations
            detailsImageOpacity.setValue(0);
            detailsTextOpacity.setValue(0);
            
            // Fade in screen container first
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }).start(() => {
              // Then fade in image
              Animated.timing(detailsImageOpacity, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }).start(() => {
                // Wait 1 additional second before fading in text
                setTimeout(() => {
                  Animated.timing(detailsTextOpacity, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                  }).start();
                }, 1000);
              });
            });
          } else if (currentScreenIndex + 1 === 2) { // HowItWorks screen is index 2
            // Reset HowItWorks animations
            howItWorksImageOpacity.setValue(0);
            howItWorksStepsOpacity.setValue(0);
            
            // Fade in screen container first
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }).start(() => {
              // Then fade in image over 2 seconds
              Animated.timing(howItWorksImageOpacity, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }).start(() => {
                // Wait 1 additional second before fading in steps container
                setTimeout(() => {
                  Animated.timing(howItWorksStepsOpacity, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                  }).start(() => {
                    // Wait 7 seconds before showing the continue button
                    setTimeout(() => {
                      setShowFinalButton(true);
                    }, 7000);
                  });
                }, 1000);
              });
            });
          } else {
            // Regular fade in for other screens
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
          }
        });
      }
    }, currentScreenIndex === 1 ? 11000 : 3000); // 11 seconds for details screen (6s + 5s extra), 3 seconds for others

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
    detailsImageOpacity,
    detailsTextOpacity,
    howItWorksImageOpacity,
    howItWorksStepsOpacity,
  };
};

export default function OnboardingScreen() {
  const { currentScreen, fadeAnim, showFinalButton, handleContinue, detailsImageOpacity, detailsTextOpacity, howItWorksImageOpacity, howItWorksStepsOpacity } = useOnboardingAnimation();

  if (!currentScreen) {
    return null;
  }

  const CurrentScreenComponent = currentScreen.component;
  const isHowItWorksScreen = currentScreen.id === 'howitworks';
  const isMurmurDetailsScreen = currentScreen.id === 'details';

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
          imageOpacity={isMurmurDetailsScreen ? detailsImageOpacity : (isHowItWorksScreen ? howItWorksImageOpacity : undefined)}
          textOpacity={isMurmurDetailsScreen ? detailsTextOpacity : undefined}
          stepsOpacity={isHowItWorksScreen ? howItWorksStepsOpacity : undefined}
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