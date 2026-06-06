import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "../lib/auth";
import { Button } from "../components/Button";
import { colors } from "../lib/theme";

export function AccountScreen() {
  const { user, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>My Account</Text>
        <Text style={styles.muted}>Signed in as</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={{ height: 24 }} />
        <Button title="Log out" variant="outline" onPress={signOut} />
      </View>
    );
  }

  const submit = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter your email and password.");
      return;
    }
    setBusy(true);
    const fn = mode === "login" ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    setBusy(false);
    if (error) {
      Alert.alert("Error", error);
    } else if (mode === "signup") {
      Alert.alert("Almost there", "Check your email to confirm your account, then log in.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>{mode === "login" ? "Log in" : "Create account"}</Text>
      <Text style={styles.muted}>Use the same account as the website.</Text>
      <View style={{ height: 16 }} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={mode === "login" ? "Log in" : "Sign up"} loading={busy} onPress={submit} />
      <Pressable onPress={() => setMode(mode === "login" ? "signup" : "login")} style={{ marginTop: 18 }}>
        <Text style={styles.switch}>
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "800", color: colors.text },
  muted: { fontSize: 14, color: colors.muted, marginTop: 4 },
  email: { fontSize: 18, fontWeight: "700", color: colors.forest, marginTop: 4 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  switch: { color: colors.nature, fontWeight: "600", textAlign: "center", fontSize: 14 },
});
