// app/meditation.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Animated,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { MainScreen, CtaButton } from '@/components/Common';


export default function MeditationScreen() {
  const [showFlower, setShowFlower] = useState(false);
  const [showPinkFlower, setShowPinkFlower] = useState(false);
  const [showCTAs, setShowCTAs] = useState(false);
  const [subtitleText, setSubtitleText] = useState("Inhale slowly for 4s");
  const [introSkipped, setIntroSkipped] = useState(false);
  
  // Animation values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const blueFlowerOpacity = useRef(new Animated.Value(0)).current;
  const pinkFlowerOpacity = useRef(new Animated.Value(0)).current;
  const flowerScale = useRef(new Animated.Value(1)).current;
  
  // Keep reference to pulse animation to stop it
  const pulseAnimationRef = useRef<{ stop: () => void } | null>(null);
  const animationStopped = useRef(false);
  const flowerTimerRef = useRef<NodeJS.Timeout | number | null>(null);
  const textTimerRef = useRef<NodeJS.Timeout | number | null>(null);

  useEffect(() => {
    setIntroSkipped(false);
    startTextSequence();
    startFlowerSequence();

    return () => {
      if (flowerTimerRef.current) {
        clearTimeout(flowerTimerRef.current);
      }
      if (textTimerRef.current) {
        clearTimeout(textTimerRef.current);
      }
    };
  }, []);

  // Helper function for text animation sequence
  const startTextSequence = () => {
    // Start title fade-in immediately
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      // Then fade in subtitle
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        // After 4 seconds (inhale duration), change subtitle to exhale
        textTimerRef.current = setTimeout(() => {
          // Fade out current subtitle
          Animated.timing(subtitleOpacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }).start(() => {
            // Change subtitle text and fade back in
            setSubtitleText("Exhale slowly for 6s");
            Animated.timing(subtitleOpacity, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }).start();
          });
        }, 4000); // 4 seconds for inhale phase
      });
    });
  };

  // Helper function for color pulse animation
  const startColorPulseAnimation = () => {
    setShowPinkFlower(true);
    let cycleCount = 0;
    
    const pulseWithColorChange = () => {
      if (animationStopped.current || cycleCount >= 3) return;
      
      cycleCount++;
      
      // Expand and transition to pink
      Animated.parallel([
        Animated.timing(flowerScale, {
          toValue: 1.25, // Scale to 357px (286 * 1.25)
          duration: 3000, // 3 seconds for deep breath in
          useNativeDriver: true,
        }),
        Animated.timing(blueFlowerOpacity, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pinkFlowerOpacity, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (animationStopped.current) return;
        
        // Contract and transition back to blue
        Animated.parallel([
          Animated.timing(flowerScale, {
            toValue: 1,
            duration: 3000, // 3 seconds for deep breath out
            useNativeDriver: true,
          }),
          Animated.timing(blueFlowerOpacity, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(pinkFlowerOpacity, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Continue the loop if not stopped and haven't reached 5 cycles
          if (!animationStopped.current && cycleCount < 3) {
            pulseWithColorChange();
          } else if (cycleCount >= 3) {
            // After 3 cycles, show CTAs
            setTimeout(() => setShowCTAs(true), 500);
          }
        });
      });
    };

    pulseAnimationRef.current = { 
      stop: () => {
        animationStopped.current = true;
      }
    };
    pulseWithColorChange();
  };

  // Helper function for starting flower display and animation
  const startFlowerAnimation = () => {
    setShowFlower(true);
    
    Animated.timing(blueFlowerOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    startColorPulseAnimation();
  };

  // Helper function for flower animation sequence
  const startFlowerSequence = () => {
    // Show flower after 14 seconds (timeline from user modification)
    flowerTimerRef.current = setTimeout(() => {
      // First fade out the text
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        startFlowerAnimation();
      });
    }, 14000);
  };

  const handleDone = () => {
    router.dismissAll();
  };

  const handleDoItAgain = () => {
    // Stop any running pulse animation
    if (pulseAnimationRef.current) {
      pulseAnimationRef.current.stop();
      pulseAnimationRef.current = null;
    }
    animationStopped.current = false; // Reset animation stopped flag
    
    // Reset all states and animations
    setShowFlower(false);
    setShowPinkFlower(false);
    setShowCTAs(false);
    setIntroSkipped(false);
    setSubtitleText("Inhale slowly for 4s"); // Reset subtitle text
    titleOpacity.setValue(0);
    subtitleOpacity.setValue(0);
    blueFlowerOpacity.setValue(0);
    pinkFlowerOpacity.setValue(0);
    flowerScale.setValue(1);
    
    // Restart the sequence using helper functions
    startTextSequence();
    startFlowerSequence();
  };

  return (
    <MainScreen>
      <View style={styles.container}>
        {/* Text content */}
        {!introSkipped && (
          <View style={styles.textContainer}>
            <Animated.Text style={[styles.mainTitle, { opacity: titleOpacity }]}>
              Clear your mind
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
              {subtitleText}
            </Animated.Text>
          </View>
        )}

        {/* Skip Intro button - only show during text phase */}
        {!showFlower && !showCTAs && (
          <View style={styles.skipContainer}>
            <CtaButton 
              onPress={() => {
                setIntroSkipped(true);
                // Clear any existing timers to stop text animations
                if (flowerTimerRef.current) {
                  clearTimeout(flowerTimerRef.current);
                  flowerTimerRef.current = null;
                }
                if (textTimerRef.current) {
                  clearTimeout(textTimerRef.current);
                  textTimerRef.current = null;
                }
                
                // Stop any running text animations
                titleOpacity.stopAnimation();
                subtitleOpacity.stopAnimation();
                
                // Reset animation stopped flag
                animationStopped.current = false;
                
                // Skip text phase and go directly to flower animation
                titleOpacity.setValue(0);
                subtitleOpacity.setValue(0);
                
                startFlowerAnimation();
              }} 
              buttonText="Skip Intro" 
              colorStyle="tertiary" 
            />
          </View>
        )}

        {/* Blue Flower */}
        {showFlower && (
          <Animated.View style={[
            styles.flowerContainer,
            { 
              opacity: blueFlowerOpacity,
              transform: [{ scale: flowerScale }]
            }
          ]}>
            <Image 
              source={require('../assets/images/flower_blue.png')} 
              style={styles.flowerImage}
              resizeMode="contain"
            />
          </Animated.View>
        )}

        {/* Pink Flower */}
        {showPinkFlower && (
          <Animated.View style={[
            styles.flowerContainer,
            { 
              opacity: pinkFlowerOpacity,
              transform: [{ scale: flowerScale }],
              position: 'absolute'
            }
          ]}>
            <Image 
              source={require('../assets/images/flower_pink.png')} 
              style={styles.flowerImage}
              resizeMode="contain"
            />
          </Animated.View>
        )}
      </View>

      {/* CTAs at bottom */}
      {showCTAs && (
        <View style={styles.ctaContainer}>
          <View style={styles.ctaButton}>
            <CtaButton onPress={handleDone} buttonText="Done" colorStyle="primary" />
          </View>
          <View style={styles.ctaButton}>
            <CtaButton onPress={handleDoItAgain} buttonText="Do It Again" colorStyle="secondary" />
          </View>
        </View>
      )}
    </MainScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mainTitle: {
    fontSize: 32,
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    color: '#4A90A4',
    textAlign: 'center',
    marginBottom: 72,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  flowerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  flowerImage: {
    width: 286,
    height: 286,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    alignItems: 'center',
    gap: 16,
  },
  ctaButton: {
    width: '100%',
    height: 64,
  },
  skipContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
});