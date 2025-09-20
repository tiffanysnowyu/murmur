import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, {useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { onboardingStorage } from '@/utils/onboardingStorage';
import OnboardingScreen from './onboarding';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});
  const colorScheme = useColorScheme();

  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  
  // Check onboarding status on component mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Use this to only show onboarding on the first app open
      let hasSeenOnboarding = await onboardingStorage.getHasSeenOnboarding();
      
      // Uncomment this to always show the onboarding screen (used for development)
      // hasSeenOnboarding = false;

      setShowOnboarding(!hasSeenOnboarding);
    };
    
    checkOnboardingStatus();
  }, []);

  const handleOnboardingComplete = async () => {
    await onboardingStorage.setHasSeenOnboarding(true);
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  // If we're still checking onboarding status, show nothing
  if (showOnboarding === null) {
    return null;
  }
  
  // If onboarding should be shown, show the onboarding screen
  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // If onboarding should not be shown then just show the normal screens
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}