// app/chooseinput.tsx
import React, { useRef } from "react";
import { View, Text, StyleSheet, Pressable, Image, Animated } from "react-native";
import { router } from "expo-router";
import { BackButton, MainScreen } from "@/components/Common";

export default function ChooseInput() {
  const textScale = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(1)).current;

  const handleChoice = (choice: "text" | "image") => {
    router.push(choice === "text" ? "/text" : "/image");
  };

  const handleTextPressIn = () => {
    Animated.spring(textScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleTextPressOut = () => {
    Animated.spring(textScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleImagePressIn = () => {
    Animated.spring(imageScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleImagePressOut = () => {
    Animated.spring(imageScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <MainScreen>
      {/* Back button */}
      <BackButton onPress={() => router.dismissAll()} buttonText="Home" />
        
      {/* Heading */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose Content Type</Text>
        <Text style={styles.subtitle}>What would you like to work with?</Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        <Pressable
          onPress={() => handleChoice("text")}
          onPressIn={handleTextPressIn}
          onPressOut={handleTextPressOut}
          style={({ pressed }) => [
            styles.pill,
            pressed && styles.pillPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Choose Text"
        >
          <Animated.View style={{ transform: [{ scale: textScale }], alignItems: 'center' }}>
            <Image source={require('../assets/images/icon_aa.png')} style={styles.pillIcon} />
            <Text style={styles.pillTitle}>Text</Text>
            {/* <Text style={styles.pillDesc}>Paste or type a claim</Text> */}
          </Animated.View>
        </Pressable>

        <Pressable
          onPress={() => handleChoice("image")}
          onPressIn={handleImagePressIn}
          onPressOut={handleImagePressOut}
          style={({ pressed }) => [
            styles.pill,
            pressed && styles.pillPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Choose Image"
        >
          <Animated.View style={{ transform: [{ scale: imageScale }], alignItems: 'center' }}>
            <Image source={require('../assets/images/icon_picture.png')} style={styles.pillIcon} />
            <Text style={styles.pillTitle}>Image</Text>
            {/* <Text style={styles.pillDesc}>Upload or snap a screenshot</Text> */}
          </Animated.View>
        </Pressable>
      </View>
    </MainScreen>
  );
}

const BORDER = "#CCE5E7";       
const FILL = "#F3F8FA";         
const TEXT_PRIMARY = "#4A4A4A"; 
const TEXT_SECONDARY = "#595959";

const styles = StyleSheet.create({
  header: {
    gap: 16, 
  },
  title: { 
    fontSize: 32,
    fontFamily: "SF Pro Display",
    fontWeight: "600", 
    color: "#1A1A1A",
  },
  subtitle: { 
    fontSize: 18,
    fontFamily: "SF Pro Display", 
    fontWeight: "400",
    color: "#1A1A1A",
    paddingBottom: 64,
  },
  options: { 
    alignItems: "center",
    gap: 24,
  },
  pill: {
    width: 345, 
    height: 128, 
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 32, 
    paddingTop: 16, 
    paddingBottom: 16, 
    paddingHorizontal: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  pillPressed: { 
    backgroundColor: FILL 
  },
  pillIcon: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  pillTitle: { 
    fontSize: 20, 
    fontFamily: "SF Pro Display",
    fontWeight: "500", 
    color: TEXT_SECONDARY, 
    marginBottom: 4,
    textAlign: "center",
    lineHeight: 36, // 150% of 24px
    letterSpacing: -0.264,
  },
  pillDesc: { 
    fontSize: 15, 
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22.5, // 150% of 15px
    letterSpacing: -0.165,
  },
});