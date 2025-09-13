// app/murmurscreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MurmurScreen() {
  const handleContinue = () => {
    router.push('/murmurdetails');
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Murmur</Text>
        </View>

        {/* Continue Button */}
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            pressed && { opacity: 0.8 }
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </View>

      {/* Bottom Navigation Icons */}
      <View style={styles.bottomNav}>
        <Pressable onPress={handleHome} style={styles.navButton}>
          <View style={styles.homeIcon} />
        </Pressable>
        <Pressable onPress={handleSkip} style={styles.navButton}>
          <View style={styles.skipIcon} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  titleContainer: {
    marginBottom: screenHeight * 0.3,
  },
  title: {
    fontSize: 48,
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    color: '#4A90A4',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: 345,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 34,
  },
  navButton: {
    padding: 16,
  },
  homeIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#1A1A1A',
    // Simple house shape approximation
    borderRadius: 4,
  },
  skipIcon: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    borderRadius: 12,
    position: 'relative',
  },
});