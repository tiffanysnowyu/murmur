import { useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";

// export const MainContainer = () => {
//   return (
//     <View style={styles.container}>
//       <View style={styles.topNav}>
//         <BackButton onPress={handleBack} buttonText={'Back'} />
//       </View>
//     </View>
//   )
// }

export const BackButton = ({ onPress, buttonText = 'Back' }: {
  onPress: () => void;
  buttonText?: string;
}) => {
  return (
    <Pressable style={styles.backButton} onPress={onPress}>
      <Text style={styles.chevron}>‹</Text>
      <Text style={styles.backText}>{buttonText}</Text>
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
    color: BACK_TEXT,
    fontWeight: "400",
  },
  primaryCta: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
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
