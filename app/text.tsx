// app/text.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';

export default function TextPage() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'analyze' | 'summarize' | null>(null);

  const handleAnalyze = () => {
    if (!text.trim()) {
      Alert.alert('Please enter some text.');
      return;
    }

    // Navigate with router.push to avoid URL encoding issues
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
      return "Paste a headline, claim, or any health statement you want fact-checked...";
    }
  };

  const getButtonText = () => {
    if (mode === 'summarize') {
      return 'Summarize Article';
    } else {
      return 'Analyze Claim';
    }
  };

  if (!mode) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>What do you need?</Text>
        
        <TouchableOpacity 
          style={styles.modeButton} 
          onPress={() => handleModeSelect('summarize')}
        >
          <View style={styles.modeButtonContent}>
            <Text style={styles.modeIcon}>📄</Text>
            <View style={styles.modeTextContainer}>
              <Text style={styles.modeTitle}>SUMMARIZE ARTICLE</Text>
              <Text style={styles.modeSubtitle}>Step 1: Summary → Step 2: Analyze claims</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.modeButton} 
          onPress={() => handleModeSelect('analyze')}
        >
          <View style={styles.modeButtonContent}>
            <Text style={styles.modeIcon}>🔍</Text>
            <View style={styles.modeTextContainer}>
              <Text style={styles.modeTitle}>ANALYZE CLAIM</Text>
              <Text style={styles.modeSubtitle}>Direct fact-checking</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMode(null)} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'summarize' ? 'Summarize Article' : 'Analyze Claim'}
        </Text>
      </View>

      <TextInput
        style={styles.input}
        multiline
        placeholder={getPlaceholder()}
        placeholderTextColor="#999"
        value={text}
        onChangeText={setText}
      />

      {text.trim() ? (
        <TouchableOpacity style={styles.button} onPress={handleAnalyze}>
          <Text style={styles.buttonText}>{getButtonText()}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.disabled]}
          onPress={() => Alert.alert('Please enter some text.')}
        >
          <Text style={styles.buttonText}>{getButtonText()}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    backgroundColor: '#fff' 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 60,
    color: '#333',
  },
  modeButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  modeIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modeSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#32535F',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    flex:1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#32535F',
    paddingVertical: 16,
    borderRadius: 8,
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});