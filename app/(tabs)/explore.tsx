import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';

export default function TabTwoScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenuOption = (option: string) => {
    setMenuVisible(false);
    if (option === 'insights') {
      router.push('/insights');
    }
    // Add other menu options here
  };

  return (
    <View style={styles.container}>
      {/* Hamburger Menu Button */}
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={() => setMenuVisible(true)}
      >
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <SafeAreaView style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('insights')}
            >
              <Text style={styles.menuIcon}>💡</Text>
              <Text style={styles.menuText}>Saved Insights</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.menuIcon}>❌</Text>
              <Text style={styles.menuText}>Close</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  menuButton: {
    position: 'absolute',
    top: 72,
    right: 24,
    zIndex: 10,
    padding: 10,
  },
  hamburgerLine: {
    width: 24,
    height: 2,
    backgroundColor: '#1A1A1A',
    marginVertical: 4,
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 180,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
});