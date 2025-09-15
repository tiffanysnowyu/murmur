import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { MainScreen } from '@/components/Common';

export default function FollowUpPage() {
  const [showGoodNews, setShowGoodNews] = useState(false);

  const handleCheckAnother = () => {
    router.push('/text');
  };

  const handleDone = () => {
    router.push('/');
  };

  return (
    <MainScreen>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>What would you like to do next?</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleCheckAnother}
          >
            <Text style={styles.checkIcon}>🔍</Text>
            <Text style={styles.primaryButtonText}>Check Another Claim</Text>
            <Text style={styles.buttonSubtext}>Verify more information</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleDone}
          >
            <Text style={styles.doneIcon}>✓</Text>
            <Text style={styles.secondaryButtonText}>Done</Text>
            <Text style={styles.buttonSubtext}>Return to home</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleSection}>
          <View style={styles.toggleHeader}>
            <Text style={styles.toggleIcon}>📰</Text>
            <Text style={styles.toggleTitle}>Good News Updates</Text>
          </View>
          
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              Show me positive news about this topic in the future
            </Text>
            <Switch
              value={showGoodNews}
              onValueChange={setShowGoodNews}
              trackColor={{ false: '#E0E0E0', true: '#81C784' }}
              thumbColor={showGoodNews ? '#4CAF50' : '#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>
          
          {showGoodNews && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ✨ We'll highlight uplifting stories and positive developments related to this topic when they become available.
              </Text>
            </View>
          )}
        </View>
      </View>
    </MainScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#32535F',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#32535F',
  },
  checkIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  doneIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  secondaryButtonText: {
    color: '#32535F',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  toggleSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  toggleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    marginRight: 16,
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
});