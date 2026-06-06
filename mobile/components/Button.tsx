import { Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, fonts } from "../lib/theme";

export function Button({
  title,
  onPress,
  loading,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "outline";
}) {
  const isOutline = variant === "outline";
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.btn,
        isOutline ? styles.outline : styles.primary,
        pressed && { opacity: 0.85 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.forest : colors.cream} />
      ) : (
        <Text style={[styles.text, { color: isOutline ? colors.forest : colors.cream }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: colors.forest },
  outline: { borderWidth: 1.5, borderColor: colors.forest, backgroundColor: "transparent" },
  text: { fontSize: 16, fontFamily: fonts.bodyBold },
});
