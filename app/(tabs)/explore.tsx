// CheckButtonStack.tsx

import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// ← your real assets
const BUTTON_SRC = require('@/assets/images/check_button.png');
const BLUR_SRC   = require('@/assets/images/check_button_blur.png');

// grab the blur image’s “real” size
const { width: BLUR_W, height: BLUR_H } = Image.resolveAssetSource(BLUR_SRC);

// known button size
const BUTTON_W = 212;
const BUTTON_H =  64;

export default function CheckButtonStack() {
  const navigation = useNavigation();
  return (
    <View style={styles.screen}>
      <View style={[styles.wrapper, { width: BLUR_W, height: BLUR_H }]}>
        {/* 1) Blur layer behind */}
        <Image
          source={BLUR_SRC}
          style={styles.blur}
          resizeMode="contain"
        />

        {/* 2) Button centered on top */}
        <View style={styles.center}>
          
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    // if you want the stack centered on screen:
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    // relative container at exactly the blur’s size
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    // sits behind everything
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
