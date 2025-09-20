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


interface IntroScreenProps {
  title: string;
  subtitle: string;
  skipIntroCallback: () => void;
  titleFadeInDuration: number;
  subtitleFadeInDuration: number;
  waitDuration: number;
  screenFinished: () => void;
  shouldFadeTitle: boolean;
}

const IntroScreen = ({
  title,
  subtitle,
  skipIntroCallback,
  titleFadeInDuration,
  subtitleFadeInDuration,
  waitDuration,
  screenFinished,
  shouldFadeTitle
}: IntroScreenProps) => {

  const titleOpacity = useRef(new Animated.Value(shouldFadeTitle ? 0 : 1)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | number | null>(null);

  useEffect(() => {
    const startSubtitleAnimation = () => {
      // Start subtitle fade-in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: subtitleFadeInDuration,
        useNativeDriver: true,
      }).start(() => {
        // After subtitle fades in, wait for waitDuration then call screenFinished
        timeoutRef.current = setTimeout(() => {
          screenFinished();
        }, waitDuration);
      });
    };

    if (shouldFadeTitle) {
      // Start title fade-in immediately
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: titleFadeInDuration,
        useNativeDriver: true,
      }).start(() => {
        // After title fades in, start subtitle fade-in
        startSubtitleAnimation();
      });
    } else {
      // Title is already visible, start subtitle animation immediately
      startSubtitleAnimation();
    }

    // Cleanup function to cancel animations and timeouts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      titleOpacity.stopAnimation();
      subtitleOpacity.stopAnimation();
    };
  }, [titleOpacity, subtitleOpacity, titleFadeInDuration, subtitleFadeInDuration, waitDuration, screenFinished, shouldFadeTitle]);

  const handleSkipIntro = () => {
    // Cancel all animations and timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    titleOpacity.stopAnimation();
    subtitleOpacity.stopAnimation();
    
    // Call the skip intro callback
    skipIntroCallback();
  };

  return (
    <>
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.mainTitle, { opacity: titleOpacity }]}>
          {title}
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          {subtitle}
        </Animated.Text>
      </View>

      <View style={styles.skipContainer}>
        <CtaButton 
          onPress={handleSkipIntro} 
          buttonText="Skip Intro" 
          colorStyle="tertiary" 
        />
      </View>
    </>
  )
}     

export default function MeditationScreen() {
  const [showFlower, setShowFlower] = useState(false);
  const [showPinkFlower, setShowPinkFlower] = useState(false);
  const [showCTAs, setShowCTAs] = useState(false);
  // const [subtitleText, setSubtitleText] = useState("Inhale slowly for 4s");
  // const [introSkipped, setIntroSkipped] = useState(false);
  // const [showClearHeart, setShowClearHeart] = useState(false);
  
  // Animation values
  // const titleOpacity = useRef(new Animated.Value(0)).current;
  // const subtitleOpacity = useRef(new Animated.Value(0)).current;
  // const clearHeartTitleOpacity = useRef(new Animated.Value(0)).current;
  // const clearHeartSubtitleOpacity = useRef(new Animated.Value(0)).current;
  const blueFlowerOpacity = useRef(new Animated.Value(0)).current;
  const pinkFlowerOpacity = useRef(new Animated.Value(0)).current;
  const flowerScale = useRef(new Animated.Value(1)).current;
  
  // Keep reference to pulse animation to stop it
  const pulseAnimationRef = useRef<{ stop: () => void } | null>(null);
  const animationStopped = useRef(false);
  const flowerTimerRef = useRef<NodeJS.Timeout | number | null>(null);
  // const textTimerRef = useRef<NodeJS.Timeout | number | null>(null);

  // useEffect(() => {
  //   setIntroSkipped(false);
  //   // startTextSequence();
  //   // startFlowerSequence();

  //   return () => {
  //     if (flowerTimerRef.current) {
  //       clearTimeout(flowerTimerRef.current);
  //     }
  //     if (textTimerRef.current) {
  //       clearTimeout(textTimerRef.current);
  //     }
  //   };
  // }, []);

  // Helper function for text animation sequence
  // const startTextSequence = () => {
  //   // Start title fade-in immediately
  //   Animated.timing(titleOpacity, {
  //     toValue: 1,
  //     duration: 1000,
  //     useNativeDriver: true,
  //   }).start(() => {
  //     // Then fade in subtitle
  //     Animated.timing(subtitleOpacity, {
  //       toValue: 1,
  //       duration: 1000,
  //       useNativeDriver: true,
  //     }).start(() => {
  //       // After 4 seconds (inhale duration), change subtitle to exhale
  //       textTimerRef.current = setTimeout(() => {
  //         // Fade out current subtitle
  //         Animated.timing(subtitleOpacity, {
  //           toValue: 0,
  //           duration: 1000,
  //           useNativeDriver: true,
  //         }).start(() => {
  //           // Change subtitle text and fade back in
  //           setSubtitleText("Exhale slowly for 6s");
  //           Animated.timing(subtitleOpacity, {
  //             toValue: 1,
  //             duration: 1000,
  //             useNativeDriver: true,
  //           }).start(() => {
  //             // After exhale phase, start clear heart screen
  //             setTimeout(() => {
  //               startClearHeartSequence();
  //             }, 6000); // 6 seconds for exhale phase
  //           });
  //         });
  //       }, 4000); // 4 seconds for inhale phase
  //     });
  //   });
  // };

  // const startClearHeartSequence = () => {
  //   // Fade out current screen
  //   Animated.parallel([
  //     Animated.timing(titleOpacity, {
  //       toValue: 0,
  //       duration: 500,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(subtitleOpacity, {
  //       toValue: 0,
  //       duration: 500,
  //       useNativeDriver: true,
  //     }),
  //   ]).start(() => {
  //     // Show clear heart screen
  //     setShowClearHeart(true);
      
  //     // Fade in clear heart title
  //     Animated.timing(clearHeartTitleOpacity, {
  //       toValue: 1,
  //       duration: 1000,
  //       useNativeDriver: true,
  //     }).start(() => {
  //       // Then fade in clear heart subtitle
  //       Animated.timing(clearHeartSubtitleOpacity, {
  //         toValue: 1,
  //         duration: 1000,
  //         useNativeDriver: true,
  //       }).start();
  //     });
  //   });
  // };


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

  // // Helper function for flower animation sequence
  // const startFlowerSequence = () => {
  //   // Show flower after clear heart screen (4s + 6s + 2s transition + 2s clear heart display = 14s)
  //   flowerTimerRef.current = setTimeout(() => {
  //     // First fade out the clear heart screen
  //     Animated.parallel([
  //       Animated.timing(clearHeartTitleOpacity, {
  //         toValue: 0,
  //         duration: 500,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(clearHeartSubtitleOpacity, {
  //         toValue: 0,
  //         duration: 500,
  //         useNativeDriver: true,
  //       }),
  //     ]).start(() => {
  //       setShowClearHeart(false);
  //       startFlowerAnimation();
  //     });
  //   }, 16000); // Extended to account for clear heart screen
  // };

  const handleDone = () => {
    router.dismissAll();
  };

  const handleSkipIntro = () => {
    // setIntroSkipped(true);

    // Clear any existing timers to stop text animations
    // if (flowerTimerRef.current) {
    //   clearTimeout(flowerTimerRef.current);
    //   flowerTimerRef.current = null;
    // }
    // if (textTimerRef.current) {
    //   clearTimeout(textTimerRef.current);
    //   textTimerRef.current = null;
    // }
    
    // // Stop any running text animations
    // titleOpacity.stopAnimation();
    // subtitleOpacity.stopAnimation();
    
    // // Reset animation stopped flag
    // animationStopped.current = false;
    
    // // Skip text phase and go directly to flower animation
    // titleOpacity.setValue(0);
    // subtitleOpacity.setValue(0);
    // clearHeartTitleOpacity.setValue(0);
    // clearHeartSubtitleOpacity.setValue(0);
    // setShowClearHeart(false);

    setPhase('flower')
    // startFlowerAnimation();
  }

  const handleDoItAgain = () => {
    // Stop any running pulse animation
    // if (pulseAnimationRef.current) {
    //   pulseAnimationRef.current.stop();
    //   pulseAnimationRef.current = null;
    // }
    // animationStopped.current = false; // Reset animation stopped flag
    
    blueFlowerOpacity.setValue(0);
    pinkFlowerOpacity.setValue(0);
    flowerScale.setValue(1);

    // Reset all states and animations
    setShowFlower(false);
    setShowPinkFlower(false);
    setShowCTAs(false);
    setPhase('intro')
    setIntroPhaseNum(0)
    // setIntroSkipped(false);
    // setShowClearHeart(false);
    // setSubtitleText("Inhale slowly for 4s"); // Reset subtitle text
    // titleOpacity.setValue(0);
    // subtitleOpacity.setValue(0);
    // clearHeartTitleOpacity.setValue(0);
    // clearHeartSubtitleOpacity.setValue(0);
    
    // Restart the sequence using helper functions
    // startTextSequence();
    // startFlowerSequence();
  };

  const [introPhaseNum, setIntroPhaseNum] = useState<number>(0)
  const [phase, setPhase] = useState<'intro' | 'flower'>('intro')
  useEffect(() => {
    // When the phase transitions to flower, start the flower animation
    if (phase == 'flower') {
      startFlowerAnimation()
    }

    return () => {
      if (flowerTimerRef.current) {
        clearTimeout(flowerTimerRef.current);
      }

      if (pulseAnimationRef.current) {
        pulseAnimationRef.current.stop();
        pulseAnimationRef.current = null;
      }
      animationStopped.current = false; // Reset animation stopped flag
    };
  }, [phase])

  const introPhases = [
    {title: 'Clear your mind', subtitle: 'Inhale for 4s', titleFadeInDuration: 1000, subtitleFadeInDuration: 2000, waitDuration: 4000, shouldFadeTitle: true},
    {title: 'Clear your mind', subtitle: 'Exhale for 6s', titleFadeInDuration: 0, subtitleFadeInDuration: 2000, waitDuration: 6000, shouldFadeTitle: false},
    {title: 'Clear your heart', subtitle: 'Inhale for 4s', titleFadeInDuration: 1000, subtitleFadeInDuration: 2000, waitDuration: 4000, shouldFadeTitle: true},
    {title: 'Clear your heart', subtitle: 'Exhale for 6s', titleFadeInDuration: 0, subtitleFadeInDuration: 2000, waitDuration: 6000, shouldFadeTitle: false}
  ]


  return (
    <MainScreen>
      <View style={styles.container}>

        {phase == 'intro' && introPhaseNum === 0 && (
          <IntroScreen
            title={introPhases[0].title}
            subtitle={introPhases[0].subtitle}
            titleFadeInDuration={introPhases[0].titleFadeInDuration}
            subtitleFadeInDuration={introPhases[0].subtitleFadeInDuration}
            waitDuration={introPhases[0].waitDuration}
            shouldFadeTitle={introPhases[0].shouldFadeTitle}
            skipIntroCallback={handleSkipIntro}
            screenFinished={() => {setIntroPhaseNum(1)}}
          />
        )}

      {phase == 'intro' && introPhaseNum === 1 && (
        <IntroScreen
          title={introPhases[1].title}
          subtitle={introPhases[1].subtitle}
          titleFadeInDuration={introPhases[1].titleFadeInDuration}
          subtitleFadeInDuration={introPhases[1].subtitleFadeInDuration}
          waitDuration={introPhases[1].waitDuration}
          shouldFadeTitle={introPhases[1].shouldFadeTitle}
          skipIntroCallback={handleSkipIntro}
          screenFinished={() => {setIntroPhaseNum(2)}}
        /> 
      )} 

      {phase == 'intro' && introPhaseNum === 2 && (
        <IntroScreen
          title={introPhases[2].title}
          subtitle={introPhases[2].subtitle}
          titleFadeInDuration={introPhases[2].titleFadeInDuration}
          subtitleFadeInDuration={introPhases[2].subtitleFadeInDuration}
          waitDuration={introPhases[2].waitDuration}
          shouldFadeTitle={introPhases[2].shouldFadeTitle}
          skipIntroCallback={handleSkipIntro}
          screenFinished={() => {
            setIntroPhaseNum(3)
          }}
        /> 
      )} 

      {phase == 'intro' && introPhaseNum === 3 && (
        <IntroScreen
          title={introPhases[3].title}
          subtitle={introPhases[3].subtitle}
          titleFadeInDuration={introPhases[3].titleFadeInDuration}
          subtitleFadeInDuration={introPhases[3].subtitleFadeInDuration}
          waitDuration={introPhases[3].waitDuration}
          shouldFadeTitle={introPhases[3].shouldFadeTitle}
          skipIntroCallback={handleSkipIntro}
          screenFinished={() => {
            setPhase('flower')
          }}
        /> 
      )} 



        {/* Text content */}
        {/* {!introSkipped && !showClearHeart && (
          <IntroScreen
            title="Clear your mind"
            subtitle={subtitleText}
            
            skipIntroCallback={handleSkipIntro}
          />
        )}

        {/* Clear Heart Screen */}
        {/* {showClearHeart && !introSkipped && (
          <View style={styles.textContainer}>
            <Animated.Text style={[styles.mainTitle, { opacity: clearHeartTitleOpacity }]}>
              Clear your heart
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, { opacity: clearHeartSubtitleOpacity }]}>
              Inhale for 4s
            </Animated.Text>
          </View>
        )} */} 

        {/* Skip Intro button - only show during text phase
        {!showFlower && !showCTAs && (
          <View style={styles.skipContainer}>
            <CtaButton 
              onPress={handleSkipIntro} 
              buttonText="Skip Intro" 
              colorStyle="tertiary" 
            />
          </View>
        )} */}

        {/* Blue Flower */}
        {phase == 'flower' && showFlower && (
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
        {phase == 'flower' && showPinkFlower && (
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
            <CtaButton onPress={handleDoItAgain} buttonText="Do it again" colorStyle="secondary" />
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