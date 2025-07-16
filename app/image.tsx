// app/image.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default function ImagePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Simple Image Page</Text>
      <Text style={styles.text}>This should load without issues</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
});