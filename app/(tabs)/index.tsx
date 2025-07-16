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

// Frames for your cross‐fade wave (you already had these)
const frames: ImageSourcePropType[] = [
  require('@/assets/animation_frames/frame_8.png'),
  require('@/assets/animation_frames/frame_5.png'),
  require('@/assets/animation_frames/frame_7.png'),
];

const DURATION       = 800; // ms per fade
const PAUSE          =   0;
const NAV_BAR_HEIGHT = 76;
const BUTTON_OFFSET  = 126;      // px above nav bar
const BUTTON_WIDTH   = 200;      // adjust to your PNG's width
const BUTTON_HEIGHT  = 56;       // adjust to your PNG's height
const FADE_EASING    = Easing.inOut(Easing.ease);

export default function AnimatedWave() {
  const fade = useRef(new Animated.Value(0)).current;
  const currentIndex = useRef(0);
  const [, tick] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loop = () => {
      if (!mounted) return;
      const next = (currentIndex.current + 1) % frames.length;
      fade.setValue(0);
      Animated.timing(fade, {
        toValue: 1,
        duration: DURATION,
        easing: FADE_EASING,
        useNativeDriver: true,
      }).start(() => {
        if (!mounted) return;
        currentIndex.current = next;
        tick((t) => t + 1);
        setTimeout(loop, PAUSE);
      });
    };
    loop();
    return () => {
      mounted = false;
      fade.stopAnimation();
    };
  }, []);

  const baseIdx = currentIndex.current;
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
    bottom: NAV_BAR_HEIGHT + BUTTON_OFFSET - 250,
    alignSelf: 'center',
    width: BUTTON_WIDTH + 200,
    height: BUTTON_HEIGHT + 500,
    marginLeft: -100,
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
    fontWeight: '500',        // "Medium" weight
    letterSpacing: -1.1,
    color: '#32535F',
  },
});