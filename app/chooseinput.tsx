// app/chooseinput.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { BackButton, MainScreen } from "@/components/Common";

export default function ChooseInput() {
  const handleChoice = (choice: "text" | "image") => {
    router.push(choice === "text" ? "/text" : "/image");
  };

  return (
    <MainScreen>
      {/* Back button */}
      <BackButton onPress={() => router.dismissAll()} buttonText="Home" />
        
      {/* Heading */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose content type</Text>
        <Text style={styles.subtitle}>What would you like to work with?</Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        <Pressable
          onPress={() => handleChoice("text")}
          style={({ pressed }) => [
            styles.pill,
            pressed && styles.pillPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Choose Text"
        >
          <Text style={styles.pillTitle}>Text</Text>
          <Text style={styles.pillDesc}>Paste or type a claim</Text>
        </Pressable>

        <Pressable
          onPress={() => handleChoice("image")}
          style={({ pressed }) => [
            styles.pill,
            pressed && styles.pillPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Choose Image"
        >
          <Text style={styles.pillTitle}>Image</Text>
          <Text style={styles.pillDesc}>Upload or snap a screenshot</Text>
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
    color: "#000000",
    paddingBottom: 24,
  },
  options: { 
    alignItems: "center",
    gap: 24,
  },
  pill: {
    width: 345, 
    height: 128, 
    borderWidth: 2,
    borderColor: BORDER,
    borderRadius: 100, 
    paddingTop: 16, 
    paddingBottom: 16, 
    paddingHorizontal: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  pillPressed: { 
    backgroundColor: FILL 
  },
  pillTitle: { 
    fontSize: 24, 
    fontFamily: "SF Pro Display",
    fontWeight: "500", 
    color: TEXT_PRIMARY, 
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