import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "../lib/auth";
import { Button } from "../components/Button";
import { colors, fonts } from "../lib/theme";

export function AccountScreen() {
  const { user, signIn, signUp, resetPassword, signOut } = useAuth();
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

  const forgot = async () => {
    if (!email) {
      Alert.alert("Enter your email", "Type your email above first, then tap “Forgot password”.");
      return;
    }
    setBusy(true);
    const { error } = await resetPassword(email.trim());
    setBusy(false);
    if (error) Alert.alert("Error", error);
    else Alert.alert("Check your email", "We sent you a link to reset your password.");
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

      {mode === "login" && (
        <Pressable onPress={forgot} style={{ marginTop: 14 }}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </Pressable>
      )}

      <Pressable onPress={() => setMode(mode === "login" ? "signup" : "login")} style={{ marginTop: 16 }}>
        <Text style={styles.switch}>
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontFamily: fonts.heading, color: colors.forest },
  muted: { fontSize: 14, fontFamily: fonts.body, color: colors.muted, marginTop: 4 },
  email: { fontSize: 18, fontFamily: fonts.bodyBold, color: colors.forest, marginTop: 4 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
    fontFamily: fonts.body,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  forgot: { color: colors.nature, fontFamily: fonts.bodySemi, textAlign: "center", fontSize: 14 },
  switch: { color: colors.nature, fontFamily: fonts.bodySemi, textAlign: "center", fontSize: 14 },
});
