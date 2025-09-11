// app/text.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function TextPage() {
  const { initialText, mode: initialMode } = useLocalSearchParams();
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'analyze' | 'summarize' | null>(null);

  useEffect(() => {
    if (initialText && typeof initialText === 'string') {
      setText(initialText);
    }
    if (initialMode && typeof initialMode === 'string') {
      setMode(initialMode as 'analyze' | 'summarize');
    }
  }, [initialText, initialMode]);

  const handleAnalyze = () => {
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

  // Mode selection screen
  if (!mode) {
    return (
      <View style={styles.container}>
        {/* Back button */}
        <Pressable style={styles.backButton} onPress={() => router.push('/chooseinput')}>
          <Text style={styles.chevron}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {/* Heading */}
        <View style={styles.header}>
          <Text style={styles.title}>Get started with text</Text>
          <Text style={styles.subtitle}>Do you want to simplify or check directly?</Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          <Pressable
            onPress={() => handleModeSelect('summarize')}
            style={({ pressed }) => [
              styles.pill,
              pressed && styles.pillPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Choose Summarize"
          >
            <Text style={styles.pillTitle}>Summarize</Text>
            <Text style={styles.pillDesc}>Simplify the article into key claims,{'\n'}analyze if needed</Text>
          </Pressable>

          <Pressable
            onPress={() => handleModeSelect('analyze')}
            style={({ pressed }) => [
              styles.pill,
              pressed && styles.pillPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Choose Analyze"
          >
            <Text style={styles.pillTitle}>Analyze</Text>
            <Text style={styles.pillDesc}>Check claims directly</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Text input screen
  return (
    <View style={styles.inputContainer}>
      {/* Back button - SEPARATE */}
      <Pressable style={styles.inputBackButton} onPress={() => setMode(null)}>
        <Text style={styles.chevron}>‹</Text>
        <Text style={styles.backText}>Back</Text>
      </Pressable>

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
        placeholderTextColor="#B0B0B8"
        value={text}
        onChangeText={setText}
      />

      {/* Submit button */}
      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          !text.trim() && styles.submitButtonDisabled,
          pressed && text.trim() && styles.submitButtonPressed,
        ]}
        onPress={handleAnalyze}
        disabled={!text.trim()}
      >
        <Text style={styles.submitButtonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const BORDER = "#CCE5E7";       
const FILL = "#F3F8FA";         
const TEXT_PRIMARY = "#4A4A4A"; 
const TEXT_SECONDARY = "#595959";
const BACK_TEXT = "#B0B0B8";
const PRIMARY = "#32535F";
const PRIMARY_PRESSED = "#2A454F";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 270,
    gap: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chevron: {
    fontSize: 24,
    color: BACK_TEXT,
    width: 24,
    height: 24,
    lineHeight: 24,
    textAlign: "center",
  },
  backText: {
    fontSize: 17,
    fontFamily: "SF Pro Display",
    color: BACK_TEXT,
    fontWeight: "400",
  },
  header: {
    gap: 16,
  },
  title: { 
    fontSize: 32,
    fontFamily: "SF Pro Display",
    fontWeight: "700", 
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
    gap: 24, // 24px gap between buttons
  },
  pill: {
    width: 345,
    minHeight: 128,
    borderWidth: 2,
    borderColor: BORDER,
    borderRadius: 100,
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pillPressed: { 
    backgroundColor: FILL,
  },
  pillTitle: { 
    fontSize: 24, 
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
  
  // Input screen styles
  inputContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  inputBackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 40,
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
    color: "#000000",
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
  },
  submitButton: {
    backgroundColor: "#1A1A1A",
    width: 345,
    height: 64,
    paddingVertical: 18,
    paddingHorizontal: 39,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 40,
  },
  submitButtonPressed: {
    backgroundColor: "#000000",
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "SF Pro Display",
    fontWeight: "600",
  },
});