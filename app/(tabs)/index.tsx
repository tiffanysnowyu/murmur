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
  const fade = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(1)).current;
  const currentIndex = useRef(0);
  const [renderIndex, setRenderIndex] = useState(0);


  // Animation effect for the wave (only runs when not showing onboarding)
  useEffect(() => {
    let mounted = true;
    let animationTimeout: NodeJS.Timeout | number;
    
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