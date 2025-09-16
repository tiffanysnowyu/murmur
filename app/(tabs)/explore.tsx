import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { MainScreen } from '@/components/Common';

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
    <MainScreen>
      {/* Black top container */}
      <View style={styles.topContainer} />
      
      {/* Menu Button */}
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={() => setMenuVisible(true)}
      >
        <Image 
          source={require('../../assets/images/icon_ellipses.png')} 
          style={styles.ellipsesIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* Centered Discovery Content */}
        <View style={styles.discoveryContainer}>
          <Image 
            source={require('../../assets/images/turtle_discovery.png')} 
            style={styles.turtleImage}
            resizeMode="contain"
          />
          <Text style={styles.discoveryText}>Discovery content coming soon.</Text>
        </View>
      </ScrollView>

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
              <Text style={styles.menuText}>Saved Insights</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </MainScreen>
  );
}

const MENU_BUTTON_TOP = 72;
const MENU_DROPDOWN_SPACING = 12; // Distance between icon and modal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topContainer: {
    position: 'absolute',
    top: -24,
    left: -24,
    right: -24,
    height: 84,
    // backgroundColor: '#7A42F4',
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  discoveryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 86, // Compensate for MainScreen's paddingBottom: 40, then -40 + 126 = 86
  },
  turtleImage: {
    width: 250,
    height: 262,
    marginBottom: 32,
  },
  discoveryText: {
    width: '100%',
    color: '#B0B0B8',
    textAlign: 'center',
    fontFamily: 'SF Pro Display',
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 48,
    letterSpacing: -0.264,
  },
  menuButton: {
    position: 'absolute',
    top: 50, // 84px container - 24px MainScreen padding - 10px padding = 50px to touch the bottom of purple container
    right: 24,
    zIndex: 10,
    padding: 10,
  },
  ellipsesIcon: {
    width: 24,
    height: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    top: 50 + 24 + 10 + MENU_DROPDOWN_SPACING, // button top + icon height + padding + spacing
    right: 20,
    display: 'flex',
    paddingVertical: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    alignSelf: 'stretch',
    borderRadius: 12,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 10,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 180,
  },
  menuText: {
    color: '#1A1A1A',
    textAlign: 'center',
    fontFamily: 'SF Pro Display',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 30,
    letterSpacing: -0.165,
  },
});