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
import { BackButton, CtaButton, MainScreen } from '@/components/Common';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MurmurScreen() {
  const handleContinue = () => {
    router.push('/murmurdetails');
  };

  const handleHome = () => {
    router.back();
  };

  return (
    <MainScreen>
      {/* Back button */}
      <View style={styles.topNav}>
        <BackButton onPress={handleHome} buttonText={'Back'} />  
      </View>

      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Murmur</Text>
        </View>
      </View>
      <CtaButton onPress={handleContinue} buttonText="Continue" />
    </MainScreen>
  );
}

const styles = StyleSheet.create({
  topNav: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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