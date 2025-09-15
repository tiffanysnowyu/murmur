// app/murmurscreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { BackButton } from '@/components/Common';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MurmurScreen() {
  const handleContinue = () => {
    router.push('/murmurdetails');
  };

  const handleHome = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <View style={styles.topNav}>
        <BackButton onPress={handleHome} buttonText={'Back'} />  
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topNav: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
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
});