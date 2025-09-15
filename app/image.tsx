// app/image.tsx
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { extractTextFromImage } from '../utils/ocr';
import { CtaButton } from '@/components/Common';

export default function ImagePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [imageExtractedText, setImageExtractedText] = useState<string | null>(null);

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

        // Alert.alert(
        //   'Text Extracted!',
        //   `Found text: "${extractedText.substring(0, 100)}${extractedText.length > 100 ? '...' : ''}"`,
        //   [
        //     {
        //       text: 'Edit Text',
        //       onPress: () => {
        //         addDebugInfo('Navigating to text editor');
        //         router.push({
        //           pathname: '/text',
        //           params: {
        //             initialText: extractedText,
        //             mode: 'analyze'
        //           }
        //         });
        //       }
        //     },
        //     {
        //       text: 'Analyze Now',
        //       onPress: () => {
        //         addDebugInfo('Navigating to analysis');
        //         router.push({
        //           pathname: '/response',
        //           params: {
        //             text: extractedText,
        //             mode: 'analyze'
        //           }
        //         });
        //       }
        //     }
        //   ]
        // );
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

  const testSimpleAlert = () => {
    addDebugInfo('Testing simple alert');
    Alert.alert('Test', 'This is a test alert');
  };

  const testNavigation = () => {
    addDebugInfo('Testing navigation to text page');
    router.push('/text');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <Pressable style={styles.backButton} onPress={handleBack}>
        <Text style={styles.chevron}>‹</Text>
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.title}>Scan Image for Text</Text>
      <Text style={styles.subtitle}>
        Upload an image containing text you'd like to fact-check
      </Text>

      {!selectedImage && !isProcessing && (
        <View style={styles.uploadSection}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImageFromLibrary}>
            <Text style={styles.uploadIcon}>📁</Text>
            <Text style={styles.uploadButtonText}>Choose from Library</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

          <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
            <Text style={styles.uploadIcon}>📷</Text>
            <Text style={styles.uploadButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedImage && !isProcessing && (
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>Selected Image:</Text>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          
          <TouchableOpacity style={styles.resetButton} onPress={resetImage}>
            <Text style={styles.resetButtonText}>Choose Different Image</Text>
          </TouchableOpacity>
        </View>
      )}

      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#32535F" />
          <Text style={styles.processingText}>Extracting text from image...</Text>
          <Text style={styles.processingSubtext}>This may take a few seconds</Text>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>💡 Tips for better results:</Text>
        <Text style={styles.infoText}>• Make sure text is clear and readable</Text>
        <Text style={styles.infoText}>• Use good lighting</Text>
        <Text style={styles.infoText}>• Avoid blurry or angled photos</Text>
      </View>

      {selectedImage && !isProcessing && imageExtractedText && (
        // <Pressable
        //   style={({ pressed }) => [
        //     styles.continueButton,
        //     pressed && { opacity: 0.8 }
        //   ]}
        //   onPress={() => router.push({
        //     pathname: '/text',
        //     params: {
        //       initialText: imageExtractedText,
        //       mode: 'analyze',
        //       cameFromImageScreen: 'true',
        //     }
        //   })}
        // >
        //   <Text style={styles.continueButtonText}>Continue</Text>
        // </Pressable>
        <CtaButton onPress={() => router.push({
          pathname: '/text',
          params: {
            initialText: imageExtractedText,
            mode: 'analyze',
            cameFromImageScreen: 'true',
          }
        })} buttonText="Continue" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // padding: 24,
    // backgroundColor: '#fff',
    // paddingTop: 60,
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
    marginBottom: 40,
  },
  chevron: {
    fontSize: 24,
    color: "#B0B0B8",
    width: 24,
    height: 24,
    lineHeight: 24,
    textAlign: "center",
  },
  backText: {
    fontSize: 17,
    fontFamily: "SF Pro Display",
    color: "#B0B0B8",
    fontWeight: "400",
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 24,
  },
  debugSection: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  testSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  uploadButton: {
    backgroundColor: '#32535F',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 200,
  },
  cameraButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  orText: {
    fontSize: 16,
    color: '#888',
    marginVertical: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  previewImage: {
    width: 250,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  continueButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: 345,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    alignSelf: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
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
  infoSection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginTop: 'auto',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
});