// app/meditation.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { MainScreen } from '@/components/Common';


export default function MeditationScreen() {
  const handleDidIt = () => {
    // Navigate back to previous screen or home
    router.back();
  };

  const handleNextTime = () => {
    // Navigate to home screen
    router.dismissAll();
  };

  return (
    <MainScreen>
      {/* Main Title */}
      <Text style={styles.mainTitle}>Take a breath</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Clear your mind</Text>

      {/* Buttons Container */}
      <View style={styles.buttonsContainer}>
        {/* I did it Button */}
        <Pressable
          style={({ pressed }) => [
            styles.didItButton,
            pressed && { opacity: 0.8 }
          ]}
          onPress={handleDidIt}
        >
          <Text style={styles.didItButtonText}>I did it</Text>
        </Pressable>

        {/* Next time Button */}
        <Pressable
          style={({ pressed }) => [
            styles.nextTimeButton,
            pressed && { opacity: 0.8 }
          ]}
          onPress={handleNextTime}
        >
          <Text style={styles.nextTimeButtonText}>Next time</Text>
        </Pressable>
      </View>
    </MainScreen>
  );
}

const styles = StyleSheet.create({
  mainTitle: {
    fontSize: 32,
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    color: '#4A90A4',
    textAlign: 'center',
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 120,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  didItButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: 345,
    alignItems: 'center',
    justifyContent: 'center',
  },
  didItButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
  },
  nextTimeButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1A1A1A',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: 345,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextTimeButtonText: {
    color: '#1A1A1A',
    fontSize: 17,
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
  },
});