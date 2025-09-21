// app/(tabs)/index.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
  TouchableOpacity,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import { Link } from 'expo-router';


const { width: screenWidth } = Dimensions.get('window');
const IMAGE_RATIO = 812 / 375;
const screenHeight = screenWidth * IMAGE_RATIO;

// Add any number of frames here - the animation will automatically adapt
const frames: ImageSourcePropType[] = [
  require('@/assets/animation_frames/frame_1.png'),
  require('@/assets/animation_frames/frame_2.png'),
  require('@/assets/animation_frames/frame_3.png'),
  require('@/assets/animation_frames/frame_4.png'),
  require('@/assets/animation_frames/frame_5.png'),
  require('@/assets/animation_frames/frame_6.png'),
  require('@/assets/animation_frames/frame_7.png'),
  require('@/assets/animation_frames/frame_8.png'),
];

// Custom durations for each frame position
const frameDurations = [
  600,
  600,
  700,
  700,
  900,
  800,
  800,
  700,
];

const PAUSE          = 0;
const NAV_BAR_HEIGHT = 76;
const BUTTON_OFFSET  = 126;      // px above nav bar
const BUTTON_WIDTH   = 200;      // adjust to your PNG's width
const BUTTON_HEIGHT  = 56;       // adjust to your PNG's height
const FADE_EASING    = Easing.inOut(Easing.ease);

export default function AnimatedWave() {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(1)).current;
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [nextFrameIndex, setNextFrameIndex] = useState(1);
  const [fadeOpacity, setFadeOpacity] = useState(0);

  // Smooth continuous animation through all frames with crossfade
  useEffect(() => {
    let mounted = true;

    // Create interpolated opacity values for smooth transitions
    const opacity1 = animatedValue.interpolate({
      inputRange: [0, frames.length],
      outputRange: [1, 1],
      extrapolate: 'clamp',
    });

    const opacity2 = animatedValue.interpolate({
      inputRange: [0, frames.length],
      outputRange: [0, 0],
      extrapolate: 'clamp',
    });

    // Update frame indices less frequently to reduce re-renders
    const listener = animatedValue.addListener(({ value }) => {
      const normalizedValue = value % frames.length;
      const currentIndex = Math.floor(normalizedValue);
      const nextIndex = (currentIndex + 1) % frames.length;

      // Only update state when frame actually changes
      setCurrentFrameIndex(prevIndex => prevIndex !== currentIndex ? currentIndex : prevIndex);
      setNextFrameIndex(prevIndex => prevIndex !== nextIndex ? nextIndex : prevIndex);

      // Use the raw normalized value for smoother opacity
      const fadeAmount = normalizedValue - Math.floor(normalizedValue);
      setFadeOpacity(fadeAmount);
    });

    const startContinuousAnimation = () => {
      if (!mounted) return;

      // Create smooth animation through all frames
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: frames.length,
          duration: frames.length * 5000, // 3s per frame for smoother transitions
          easing: Easing.linear, // Linear for consistent frame timing
          useNativeDriver: false, // Need to read value for frame calculation
        }),
        { iterations: -1 } // Infinite loop
      ).start();
    };

    // Start the animation
    startContinuousAnimation();

    return () => {
      mounted = false;
      animatedValue.removeListener(listener);
      animatedValue.stopAnimation();
    };
  }, []);

  // console.log(`Current index ${currentFrameIndex} next frame index ${nextFrameIndex}`)


  const handleCheckPressIn = () => {
    Animated.spring(checkScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleCheckPressOut = () => {
    Animated.spring(checkScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.fullScreen}>

      {/* Smooth wave animation with crossfade between frames */}
      <Animated.Image
        source={frames[currentFrameIndex]}
        style={[
          styles.wave,
          {
            opacity: 1 - fadeOpacity,
          }
        ]}
        resizeMode="contain"
        fadeDuration={0} // Disable default fade animation
      />
      <Animated.Image
        source={frames[nextFrameIndex]}
        style={[
          styles.wave,
          {
            opacity: fadeOpacity,
          }
        ]}
        resizeMode="contain"
        fadeDuration={0} // Disable default fade animation
      />

      {/* Blur effects positioned behind button */}
      <View style={styles.checkBlur}>
        <Image
          source={require('@/assets/images/check_button_blur.png')}
          style={styles.blurImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.checkBg}>
        <Image
          source={require('@/assets/images/check_button_bg.png')}
          style={styles.blurImage}
          resizeMode="contain"
        />
      </View>

      {/* Green blur on left side */}
      <View style={styles.greenBlur}>
        <Image
          source={require('@/assets/images/blur_green.png')}
          style={styles.blurImage}
          resizeMode="contain"
        />
      </View>

      {/* Check button - leads to onboarding */}
      <Link href="./chooseinput" asChild>
        <TouchableOpacity
          style={styles.checkWrapper}
          activeOpacity={0.8}
          onPressIn={handleCheckPressIn}
          onPressOut={handleCheckPressOut}
          onPress={() => {
            /* your check handler */
          }}
        >
          <ImageBackground
            source={require('@/assets/images/check_button.png')}
            style={styles.checkImage}
            imageStyle={styles.checkImage}
          >
            <Animated.Text style={[styles.checkText, { transform: [{ scale: checkScale }] }]}>
              Check
            </Animated.Text>
          </ImageBackground>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#fff',
    position: 'relative',
  },
  wave: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  menuButton: {
    position: 'absolute',
    top: 72,
    right: 24,
    zIndex: 10,
    padding: 10,
  },
  hamburgerLine: {
    width: 24,
    height: 2,
    backgroundColor: '#1A1A1A',
    marginVertical: 4,
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 180,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  checkBlur: {
    position: 'absolute',
    bottom: NAV_BAR_HEIGHT + BUTTON_OFFSET - 150, // Lower to extend more below
    alignSelf: 'center',
    width: BUTTON_WIDTH, // Much wider for dramatic effect
    height: BUTTON_HEIGHT + 250, // Much taller for dramatic effect
    marginLeft: -120, // Shift more to the left
    zIndex: 3, // ON TOP of the button
    pointerEvents: 'none', // Don't block button touches
    // borderWidth: 1,
    // borderColor: 'red',
  },
  checkBg: {
    position: 'absolute',
    bottom: NAV_BAR_HEIGHT + BUTTON_OFFSET - 300,
    alignSelf: 'center',
    width: BUTTON_WIDTH + 300,
    height: BUTTON_HEIGHT + 600,
    marginLeft: -25,
    zIndex: 1, // Behind the button (underneath)
  },
  greenBlur: {
    position: 'absolute',
    bottom: NAV_BAR_HEIGHT + BUTTON_OFFSET - 150, // Same vertical position as checkBlur
    alignSelf: 'center',
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT + 250,
    marginLeft: -200, // Positioned to the left of the button
    zIndex: 3, // ON TOP of the button, same as checkBlur
    pointerEvents: 'none', // Don't block button touches
  },
  blurImage: {
    width: '100%',
    height: '100%',
    opacity: 1, // Make sure it's fully opaque
  },
  checkWrapper: {
    position: 'absolute',
    bottom: NAV_BAR_HEIGHT + BUTTON_OFFSET, // 76 + 126 = 202px
    alignSelf: 'center',
    zIndex: 2, // Between background and blur
  },
  checkImage: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 24,
    fontWeight: '500', // "Medium" weight
    letterSpacing: -1.1,
    color: '#32535F',
  },
});