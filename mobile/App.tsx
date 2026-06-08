import "react-native-url-polyfill/auto";
import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  StatusBar as RNStatusBar,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from "@expo-google-fonts/open-sans";
import { AuthProvider } from "./lib/auth";
import { CartProvider, useCart } from "./lib/cart";
import { ShopScreen } from "./screens/ShopScreen";
import { ProductScreen } from "./screens/ProductScreen";
import { AccountScreen } from "./screens/AccountScreen";
import { CartScreen } from "./screens/CartScreen";
import { colors, fonts } from "./lib/theme";

type Tab = "shop" | "cart" | "account";

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.forest} size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <Shell />
      </CartProvider>
    </AuthProvider>
  );
}

function Shell() {
  const [tab, setTab] = useState<Tab>("shop");
  const [productId, setProductId] = useState<string | null>(null);
  const { totalItems } = useCart();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {/* Faint site-wide wellness background, like the website */}
      <Image
        source={require("./assets/wellness-line.png")}
        style={styles.bgImage}
        resizeMode="cover"
      />

      <View style={styles.topbar}>
        <Text style={styles.brand}>HEALTEEN CARE</Text>
        <Text style={styles.tagline}>Natural Healthcare &amp; Herbal Wellness</Text>
      </View>

      <View style={{ flex: 1 }}>
        {productId ? (
          <ProductScreen id={productId} onBack={() => setProductId(null)} />
        ) : tab === "shop" ? (
          <ShopScreen onOpenProduct={setProductId} />
        ) : tab === "cart" ? (
          <CartScreen onShop={() => setTab("shop")} />
        ) : (
          <AccountScreen />
        )}
      </View>

      {!productId && (
        <View style={styles.tabbar}>
          <TabButton label="Shop" active={tab === "shop"} onPress={() => setTab("shop")} />
          <TabButton
            label="Cart"
            active={tab === "cart"}
            onPress={() => setTab("cart")}
            badge={totalItems}
          />
          <TabButton label="Account" active={tab === "account"} onPress={() => setTab("account")} />
        </View>
      )}
    </SafeAreaView>
  );
}

function TabButton({
  label,
  active,
  onPress,
  badge,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  badge?: number;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <View>
        <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream },
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.12,
    pointerEvents: "none",
  },
  topbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(248,245,238,0.92)",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: { fontSize: 20, fontFamily: fonts.heading, letterSpacing: 0.5, color: colors.forest },
  tagline: { fontSize: 11, fontFamily: fonts.body, color: colors.muted, marginTop: 2 },
  tabbar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14 },
  tabText: { fontSize: 14, fontFamily: fonts.bodySemi, color: colors.muted },
  tabTextActive: { color: colors.forest, fontFamily: fonts.bodyBold },
  badge: {
    position: "absolute",
    top: -8,
    right: -16,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.terracotta,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.white, fontSize: 10, fontFamily: fonts.bodyBold },
});
