// app/chooseinput.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function ChoiceInput() {
  return (
    <View style={styles.container}>
      <Link href="/text" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Analyze Text</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/image" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Analyze Image</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#32535F',
    paddingVertical: 14,
    borderRadius: 6,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
