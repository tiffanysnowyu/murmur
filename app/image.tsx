// app/image.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { extractTextFromImage } from '../utils/ocr';
import { BackButton, CtaButton, MainScreen } from '@/components/Common';

export default function ImagePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [imageExtractedText, setImageExtractedText] = useState<string | null>(null);
  
  const uploadScale = useRef(new Animated.Value(1)).current;
  const captureScale = useRef(new Animated.Value(1)).current;

  // Debug helper
  const addDebugInfo = (info: string) => {
    console.log('🐛 DEBUG:', info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    addDebugInfo('Image page loaded');
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const libraryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      
      addDebugInfo(`Library permission: ${libraryStatus.status}`);
      addDebugInfo(`Camera permission: ${cameraStatus.status}`);
    } catch (error) {
      addDebugInfo(`Permission check error: ${error}`);
    }
  };

  const requestPermissions = async () => {
    try {
      addDebugInfo('Requesting media library permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      addDebugInfo(`Permission result: ${status}`);
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to photos to upload images.');
        return false;
      }
      return true;
    } catch (error) {
      addDebugInfo(`Permission request error: ${error}`);
      return false;
    }
  };

  const pickImageFromLibrary = async () => {
    try {
      addDebugInfo('Starting image picker...');
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        addDebugInfo('Permission denied, stopping');
        return;
      }

      addDebugInfo('Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      addDebugInfo(`Image picker result: ${JSON.stringify({
        canceled: result.canceled,
        hasAssets: result.assets ? result.assets.length : 0
      })}`);

      if (!result.canceled && result.assets && result.assets[0]) {
        addDebugInfo(`Selected image URI: ${result.assets[0].uri}`);
        setSelectedImage(result.assets[0].uri);
        await processImage(result.assets[0].uri);
      } else {
        addDebugInfo('Image selection was canceled or failed');
      }
    } catch (error) {
      addDebugInfo(`Image picker error: ${error}`);
      Alert.alert('Error', `Image picker failed: ${error}`);
    }
  };

  const takePhoto = async () => {
    try {
      addDebugInfo('Starting camera...');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      addDebugInfo(`Camera permission: ${status}`);
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to camera to take photos.');
        return;
      }

      addDebugInfo('Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      addDebugInfo(`Camera result: ${JSON.stringify({
        canceled: result.canceled,
        hasAssets: result.assets ? result.assets.length : 0
      })}`);

      if (!result.canceled && result.assets && result.assets[0]) {
        addDebugInfo(`Captured image URI: ${result.assets[0].uri}`);
        setSelectedImage(result.assets[0].uri);
        await processImage(result.assets[0].uri);
      } else {
        addDebugInfo('Camera was canceled or failed');
      }
    } catch (error) {
      addDebugInfo(`Camera error: ${error}`);
      Alert.alert('Error', `Camera failed: ${error}`);
    }
  };

  const processImage = async (imageUri: string) => {
    try {
      addDebugInfo(`Processing image: ${imageUri}`);
      setIsProcessing(true);
      
      // Extract actual text from image using OCR
      try {
        const extractedText = await extractTextFromImage(imageUri);
        
        addDebugInfo('Text extraction complete');
        setIsProcessing(false);
        
        if (!extractedText || extractedText === 'No text found in image') {
          Alert.alert(
            'No Text Found',
            'We couldn\'t find any text in this image. Please try another image with clearer text.',
            [{ text: 'OK', onPress: resetImage }]
          );
          return;
        }
        
        setImageExtractedText(extractedText);
      } catch (ocrError) {
        addDebugInfo(`OCR error: ${ocrError}`);
        setIsProcessing(false);
        Alert.alert(
          'Text Extraction Failed',
          'Could not extract text from this image. Please make sure the image contains clear, readable text.',
          [{ text: 'Try Again', onPress: resetImage }]
        );
      }
    } catch (error) {
      addDebugInfo(`Process image error: ${error}`);
      setIsProcessing(false);
    }
  };
  const resetImage = () => {
    addDebugInfo('Resetting image');
    setSelectedImage(null);
    setIsProcessing(false);
  };

  const handleUploadPressIn = () => {
    Animated.spring(uploadScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleUploadPressOut = () => {
    Animated.spring(uploadScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleCapturePressIn = () => {
    Animated.spring(captureScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleCapturePressOut = () => {
    Animated.spring(captureScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <MainScreen>
      <View style={styles.content}>
        {/* Back button */}
        <BackButton onPress={handleBack} buttonText="Back" />

      {/* Heading */}
      <View style={styles.header}>
        <Text style={styles.title}>Upload Image</Text>
        {!selectedImage && !isProcessing && (
          <Text style={styles.subtitle}>
            How would you like to add your image?
          </Text>
        )}
      </View>

      {/* Options */}
      {!selectedImage && !isProcessing && (
        <View style={styles.options}>
          <Pressable
            onPress={pickImageFromLibrary}
            onPressIn={handleUploadPressIn}
            onPressOut={handleUploadPressOut}
            style={({ pressed }) => [
              styles.pill,
              pressed && styles.pillPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Choose from Library"
          >
            <Animated.View style={{ transform: [{ scale: uploadScale }], alignItems: 'center' }}>
              <Image source={require('../assets/images/icon_picture.png')} style={styles.pillIcon} />
              <Text style={styles.pillTitle}>Upload Image</Text>
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={takePhoto}
            onPressIn={handleCapturePressIn}
            onPressOut={handleCapturePressOut}
            style={({ pressed }) => [
              styles.pill,
              pressed && styles.pillPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Take Photo"
          >
            <Animated.View style={{ transform: [{ scale: captureScale }], alignItems: 'center' }}>
              <Image source={require('../assets/images/icon_camera.png')} style={styles.pillIcon} />
              <Text style={styles.pillTitle}>Capture Image</Text>
            </Animated.View>
          </Pressable>
        </View>
      )}

      {selectedImage && !isProcessing && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          
          <View style={styles.resetButtonContainer}>
            <TouchableOpacity style={styles.resetButton} onPress={resetImage}>
              <Text style={styles.resetButtonText}>Choose New Image</Text>
            </TouchableOpacity>
          </View>
          
          <Image source={require('../assets/images/icon_info.png')} style={styles.infoIcon} />
          <Text style={styles.infoText}>Best results: upload a clean screenshot. If taking a photo, fill the frame and avoid glare.</Text>
        </View>
      )}

      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#32535F" />
          <Text style={styles.processingText}>Extracting text from image...</Text>
          <Text style={styles.processingSubtext}>This may take a few seconds</Text>
        </View>
      )}
      </View>

      {selectedImage && !isProcessing && imageExtractedText && (
        <CtaButton 
          onPress={() => router.push({
            pathname: '/text',
            params: {
              initialText: imageExtractedText,
              mode: 'analyze',
              cameFromImageScreen: 'true',
            }
          })}
          buttonText="Continue" 
          colorStyle="primary" 
        />
      )}
    </MainScreen>
  );
}

const BORDER = "#CCE5E7";       
const FILL = "#F3F8FA";         
const TEXT_PRIMARY = "#4A4A4A"; 
const TEXT_SECONDARY = "#595959";

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    paddingBottom: 40,
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
    paddingBottom: 8,
  },
  pillTitle: { 
    fontSize: 20, 
    fontFamily: "SF Pro Display",
    fontWeight: "500", 
    color: TEXT_SECONDARY, 
    textAlign: "center",
    lineHeight: 36,
    letterSpacing: -0.264,
  },
  imageContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginLeft: -24,
    marginRight: -24,
    paddingBottom: 16,
    resizeMode: 'cover',
  },
  resetButtonContainer: {
    paddingBottom: 32,
    alignSelf: 'flex-start',
  },
  resetButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CCE5E7',
  },
  resetButtonText: {
    color: '#4A4A4A',
    fontFamily: 'SF Pro Display',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.176,
  },
  infoIcon: {
    width: 24,
    height: 24,
    alignSelf: 'flex-start',
  },
  infoText: {
    paddingTop: 16,
    fontSize: 16,
    fontFamily: 'SF Pro Display',
    color: '#1A1A1A',
    textAlign: 'left',
    lineHeight: 24,
  },
  processingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#333',
  },
  processingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});