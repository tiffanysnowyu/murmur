import { View, Text, StyleSheet, Pressable } from "react-native";


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
});
