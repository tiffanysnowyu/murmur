// app/text.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Animated,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton, CtaButton, MainScreen } from '@/components/Common';

export default function TextPage() {
  const { initialText, mode: initialMode, cameFromImageScreen } = useLocalSearchParams();
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'analyze' | 'summarize' | null>(null);
  
  // Animation state
  const continueButtonScale = useRef(new Animated.Value(1)).current;
  const summarizeScale = useRef(new Animated.Value(1)).current;
  const analyzeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (initialText && typeof initialText === 'string') {
      setText(initialText);
    }
    if (initialMode && typeof initialMode === 'string') {
      setMode(initialMode as 'analyze' | 'summarize');
    }
  }, [initialText, initialMode]);

  const handleContinueButton = () => {
    if (!text.trim()) {
      Alert.alert('Please enter some text.');
      return;
    }

    router.push({
      pathname: '/response',
      params: {
        text: text.trim(),
        mode: mode
      }
    });
  };

  const handleModeSelect = (selectedMode: 'analyze' | 'summarize') => {
    setMode(selectedMode);
    setText(''); // Clear text when switching modes
  };

  const getPlaceholder = () => {
    if (mode === 'summarize') {
      return "Paste an article URL, headline, or any paragraph/excerpt from the article - I'll find and analyze the full story...";
    } else {
      return "Type or paste anything - headlines, articles, or questions. Any format works.";
    }
  };

  const getButtonText = () => {
    if (mode === 'summarize') {
      return 'Summarize Article';
    } else {
      return 'Analyze Claim';
    }
  };

  // Continue button press animations
  const handleContinueButtonPressIn = () => {
    Animated.spring(continueButtonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleContinueButtonPressOut = () => {
    Animated.spring(continueButtonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleSummarizePressIn = () => {
    Animated.spring(summarizeScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleSummarizePressOut = () => {
    Animated.spring(summarizeScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleAnalyzePressIn = () => {
    Animated.spring(analyzeScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleAnalyzePressOut = () => {
    Animated.spring(analyzeScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Mode selection screen
  if (!mode) {
    return (
      <MainScreen>
        {/* Back button */}
        <BackButton onPress={() => router.back()} />
        

        {/* Heading */}
        <View style={styles.header}>
          <Text style={styles.title}>Get started with text</Text>
          <Text style={styles.subtitle}>Do you want to simplify or check directly?</Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          <Pressable
            onPress={() => handleModeSelect('summarize')}
            onPressIn={handleSummarizePressIn}
            onPressOut={handleSummarizePressOut}
            style={({ pressed }) => [
              styles.pill,
              pressed && styles.pillPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Choose Summarize"
          >
            <Animated.View style={{ transform: [{ scale: summarizeScale }], alignItems: 'center' }}>
              <Text style={styles.pillTitle}>Summarize</Text>
              <Text style={styles.pillDesc}>Simplify the article into key claims,{'\n'}analyze if needed</Text>
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={() => handleModeSelect('analyze')}
            onPressIn={handleAnalyzePressIn}
            onPressOut={handleAnalyzePressOut}
            style={({ pressed }) => [
              styles.pill,
              pressed && styles.pillPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Choose Analyze"
          >
            <Animated.View style={{ transform: [{ scale: analyzeScale }], alignItems: 'center' }}>
              <Text style={styles.pillTitle}>Analyze</Text>
              <Text style={styles.pillDesc}>Check claims directly</Text>
            </Animated.View>
          </Pressable>
        </View>
      </MainScreen>
    );
  }

  // Text input screen after the mode is selected
  return (
    <MainScreen>
        {/* Back button - SEPARATE. In this case just reset the mode to null to show the mode selection screen.
          If the original screen was the image screen then go back to that. */}
        <BackButton onPress={() => cameFromImageScreen ? router.back() : setMode(null)} />

        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 0 }}
            keyboardShouldPersistTaps="never"
          >
            {/* Title and description - NO BACK BUTTON HERE */}
            <View style={styles.inputHeader}>
              <Text style={styles.inputTitle}>
                {mode === 'summarize' ? 'Summarize' : 'Analyze'}
              </Text>
              <Text style={styles.inputDescription}>
                {mode === 'summarize' 
                  ? "Too long to read? Paste the article and we'll pull out the key points and claims (you can analyze them afterwards)."
                  : "Type or paste any claim, headline, or statement you want to fact-check."}
              </Text>
            </View>

            {/* Divider line */}
            <View style={styles.divider} />

            {/* Text input */}
            <TextInput
              style={styles.input}
              multiline
              placeholder="Paste text here..."
              placeholderTextColor="#D1D1D6"
              value={text}
              onChangeText={setText}
            />

            {/* Submit button - show on both modes when text is entered */}
            {text.trim() && (
              <CtaButton onPress={handleContinueButton} buttonText="Continue" />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </MainScreen>
  );
}

const BORDER = "#CCE5E7";       
const FILL = "#F6FBFB";         
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
    gap: 24, // 24px gap between buttons
  },
  pill: {
    width: 345,
    minHeight: 128,
    borderWidth: 2,
    borderColor: BORDER,
    borderRadius: 32,
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pillPressed: { 
    backgroundColor: FILL,
  },
  pillTitle: { 
    fontSize: 20, 
    fontFamily: "SF Pro Display",
    fontWeight: "500", 
    color: TEXT_PRIMARY, 
    marginBottom: 4,
    textAlign: "center",
    lineHeight: 36,
    letterSpacing: -0.264,
  },
  pillDesc: { 
    fontSize: 15, 
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22.5,
    letterSpacing: -0.165,
  },
  inputHeader: {
    marginBottom: 48, // 48px to divider
  },
  inputTitle: {
    fontSize: 32,
    fontFamily: "SF Pro Display",
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  inputDescription: {
    fontSize: 17,
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: "#1A1A1A",
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#D0D0D0",
    marginBottom: 48, // 48px after divider
  },
  input: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    textAlignVertical: "top",
    fontSize: 17,
    fontFamily: "SF Pro Display",
    color: "#1A1A1A",
    paddingBottom: 64,
  },
});