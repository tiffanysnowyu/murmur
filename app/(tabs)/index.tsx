// app/(tabs)/index.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
  TouchableOpacity,
  ImageBackground,
  Text,
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
];

// Custom durations for each frame position
const frameDurations = [
  600,
  700,
  700,
  900,
  700,
  800,
  600,
];

const PAUSE          = 0;
const NAV_BAR_HEIGHT = 76;
const BUTTON_OFFSET  = 126;      // px above nav bar
const BUTTON_WIDTH   = 200;      // adjust to your PNG's width
const BUTTON_HEIGHT  = 56;       // adjust to your PNG's height
const FADE_EASING    = Easing.inOut(Easing.ease);

export default function AnimatedWave() {
  const fade = useRef(new Animated.Value(0)).current;
  const currentIndex = useRef(0);
  const [renderIndex, setRenderIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    let animationTimeout: NodeJS.Timeout;
    
    const loop = () => {
      if (!mounted) return;
      
      // Get the current frame's duration
      const currentDuration = frameDurations[currentIndex.current] * 1.2;
      
      fade.setValue(0);
      Animated.timing(fade, {
        toValue: 1,
        duration: currentDuration,
        easing: FADE_EASING,
        useNativeDriver: true,
      }).start(() => {
        if (!mounted) return;
        
        // Update the index after animation completes
        currentIndex.current = (currentIndex.current + 1) % frames.length;
        setRenderIndex(currentIndex.current);
        
        // Small delay before next loop to prevent flicker
        animationTimeout = setTimeout(loop, PAUSE);
      });
    };
    
    // Initial delay to show first frame
    animationTimeout = setTimeout(loop, 100);
    
    return () => {
      mounted = false;
      if (animationTimeout) clearTimeout(animationTimeout);
      fade.stopAnimation();
    };
  }, [fade]);

  const baseIdx = renderIndex;
  const nextIdx = (baseIdx + 1) % frames.length;

  return (
    <View style={styles.fullScreen}>
      {/* Wave animation */}
      <Image
        source={frames[baseIdx]}
        style={styles.wave}
        resizeMode="contain"
      />
      <Animated.Image
        source={frames[nextIdx]}
        style={[styles.wave, { opacity: fade }]}
        resizeMode="contain"
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

      {/* Check button - your exact original code */}
      <Link href="./chooseinput" asChild>
        <TouchableOpacity
          style={styles.checkWrapper}
          activeOpacity={0.8}
          onPress={() => {
            /* your check handler */
          }}
        >
          <ImageBackground
            source={require('@/assets/images/check_button.png')}
            style={styles.checkImage}
            imageStyle={styles.checkImage}
          >
            <Text style={styles.checkText}>Check</Text>
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