import { useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, SafeAreaView } from "react-native";

export const MainScreen = ({ children, backgroundColor = "#FFFFFF" }: {
  children: React.ReactNode;
  backgroundColor?: string;
}) => {
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor }]}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}>{children}</View>
    </SafeAreaView>
  )
}

export const BackButton = ({ onPress, buttonText = 'Back' }: {
  onPress: () => void;
  buttonText?: string;
}) => {
  const backScale = useRef(new Animated.Value(1)).current;

  const handleBackPressIn = () => {
    Animated.spring(backScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleBackPressOut = () => {
    Animated.spring(backScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable 
      style={styles.backButton} 
      onPress={onPress}
      onPressIn={handleBackPressIn}
      onPressOut={handleBackPressOut}
    >
      <Animated.View style={{ transform: [{ scale: backScale }], flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={styles.chevron}>‹</Text>
        <Text style={styles.backText}>{buttonText}</Text>
      </Animated.View>
    </Pressable>
  )
}

export const CtaButton = ({ onPress, buttonText = 'Continue', colorStyle = 'primary' }: {
  onPress: () => void;
  buttonText?: string;
  colorStyle?: 'primary' | 'secondary';
}) => {

  const ctaScale = useRef(new Animated.Value(1)).current;
  

  const onPressIn = () => {
    Animated.spring(ctaScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }

  const onPressOut = () => {
    Animated.spring(ctaScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Pressable 
      style={colorStyle === 'primary' ? styles.primaryCta : styles.secondaryCta} 
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
        <Text style={colorStyle === 'primary' ? styles.primaryCtaText : styles.secondaryCtaText}>{buttonText}</Text>
      </Animated.View>
    </Pressable>
  )
}


const BACK_TEXT = "#B0B0B8";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backButton: {
    paddingBottom: 40,
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
    color: BACK_TEXT,
    fontWeight: "400",
  },
  primaryCta: {
    height: 64,
    backgroundColor: "#1A1A1A",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCtaText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "SF Pro Display",
    fontWeight: "600",
  },
  secondaryCta: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryCtaText: {
    color: "#1A1A1A",
    fontSize: 17,
    fontFamily: "SF Pro Display",
    fontWeight: "600",
  }, 
});
