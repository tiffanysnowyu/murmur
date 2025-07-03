// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { View, Image, Animated, StyleSheet, Easing } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const BAR_HEIGHT   = 76;
const ICON_SIZE    = 48;
const FADE_DURATION = 1000; // 1s for a clearly visible fade

type FadeIconProps = {
  focused: boolean;
  outline: any;
  filled: any;
};

function FadeIcon({ focused, outline, filled }: FadeIconProps) {
  // Animated.Value drives both opacities
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: focused ? 1 : 0,
      duration: FADE_DURATION,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [focused, anim]);

  // outline goes 1→0, filled goes 0→1
  const outlineOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.iconContainer}>
      <Animated.Image
        source={outline}
        style={[styles.icon, { opacity: outlineOpacity }]}
        resizeMode="contain"
      />
      <Animated.Image
        source={filled}
        style={[styles.icon, styles.filledOverlay, { opacity: anim }]}
        resizeMode="contain"
      />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: tint,
        tabBarButton: HapticTab,

        // Solid white bar, 76px tall, with top border #E0E0E0
        tabBarBackground: () => <View style={styles.barBg} />,
        tabBarStyle: {
          height: BAR_HEIGHT,
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
        },

        // Each cell 76px high, no padding
        tabBarItemStyle: {
          height: BAR_HEIGHT,
          margin: 0,
          padding: 0,
        },

        // Push icon down so it has (76–48)/2 = 14px breathing room above
        tabBarIconStyle: {
          marginTop: (BAR_HEIGHT - ICON_SIZE) / 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <FadeIcon
              focused={focused}
              outline={require('@/assets/images/house.png')}
              filled={require('@/assets/images/house_filled.png')}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <FadeIcon
              focused={focused}
              outline={require('@/assets/images/compass.png')}
              filled={require('@/assets/images/compass_filled.png')}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barBg: {
    flex: 1,
    backgroundColor: '#fff',
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    position: 'relative',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  filledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
