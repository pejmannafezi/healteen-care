import "react-native-url-polyfill/auto";
import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./lib/auth";
import { ShopScreen } from "./screens/ShopScreen";
import { ProductScreen } from "./screens/ProductScreen";
import { AccountScreen } from "./screens/AccountScreen";
import { colors } from "./lib/theme";

type Tab = "shop" | "account";

export default function App() {
  const [tab, setTab] = useState<Tab>("shop");
  const [productId, setProductId] = useState<string | null>(null);

  return (
    <AuthProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.topbar}>
          <Text style={styles.brand}>HEALTEEN CARE</Text>
          <Text style={styles.tagline}>Natural Healthcare &amp; Herbal Wellness</Text>
        </View>

        <View style={{ flex: 1 }}>
          {productId ? (
            <ProductScreen id={productId} onBack={() => setProductId(null)} />
          ) : tab === "shop" ? (
            <ShopScreen onOpenProduct={setProductId} />
          ) : (
            <AccountScreen />
          )}
        </View>

        {!productId && (
          <View style={styles.tabbar}>
            <TabButton label="Shop" active={tab === "shop"} onPress={() => setTab("shop")} />
            <TabButton label="Account" active={tab === "account"} onPress={() => setTab("account")} />
          </View>
        )}
      </SafeAreaView>
    </AuthProvider>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  topbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: { fontSize: 18, fontWeight: "800", letterSpacing: 1, color: colors.forest },
  tagline: { fontSize: 11, color: colors.muted, marginTop: 2 },
  tabbar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: "600", color: colors.muted },
  tabTextActive: { color: colors.forest, fontWeight: "800" },
});
