import { View, Text, Image, FlatList, Pressable, StyleSheet, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useCart } from "../lib/cart";
import { Button } from "../components/Button";
import { formatPrice } from "../lib/format";
import { colors, fonts } from "../lib/theme";

const SITE_URL = "https://healteen-care.vercel.app";

export function CartScreen({ onShop }: { onShop: () => void }) {
  const { items, setQty, remove, totalCents, clear } = useCart();
  const currency = items[0]?.currency ?? "USD";

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Browse the shop and add some wellness essentials.</Text>
        <View style={{ height: 16 }} />
        <Button title="Go to Shop" onPress={onShop} />
      </View>
    );
  }

  const checkout = () => {
    Alert.alert(
      "Checkout",
      "In-app payment is coming soon. You can finish your order securely on our website.",
      [
        { text: "Not now", style: "cancel" },
        { text: "Open website", onPress: () => WebBrowser.openBrowserAsync(`${SITE_URL}/en/shop`) },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.productId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.title}>Your Cart</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.img} />
            ) : (
              <View style={[styles.img, styles.imgPlaceholder]} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.price}>{formatPrice(item.priceCents, item.currency)}</Text>
              <View style={styles.stepper}>
                <Pressable style={styles.stepBtn} onPress={() => setQty(item.productId, item.quantity - 1)}>
                  <Text style={styles.stepText}>−</Text>
                </Pressable>
                <Text style={styles.qty}>{item.quantity}</Text>
                <Pressable style={styles.stepBtn} onPress={() => setQty(item.productId, item.quantity + 1)}>
                  <Text style={styles.stepText}>+</Text>
                </Pressable>
                <Pressable style={styles.remove} onPress={() => remove(item.productId)}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(totalCents, currency)}</Text>
        </View>
        <Button title="Checkout" onPress={checkout} />
        <Pressable onPress={clear} style={{ marginTop: 10 }}>
          <Text style={styles.clear}>Clear cart</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: { fontSize: 22, fontFamily: fonts.heading, color: colors.forest },
  emptyText: { fontSize: 14, fontFamily: fonts.body, color: colors.muted, textAlign: "center", marginTop: 6 },
  list: { padding: 16, paddingBottom: 12 },
  title: { fontSize: 26, fontFamily: fonts.heading, color: colors.forest, marginBottom: 12 },
  row: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  img: { width: 72, height: 72, borderRadius: 10, backgroundColor: colors.cream },
  imgPlaceholder: { backgroundColor: colors.cream },
  name: { fontSize: 14, fontFamily: fonts.headingSemi, color: colors.forest },
  price: { fontSize: 14, fontFamily: fonts.bodyBold, color: colors.forest, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 8 },
  stepBtn: {
    width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center", backgroundColor: colors.cream,
  },
  stepText: { fontSize: 18, fontFamily: fonts.bodyBold, color: colors.forest },
  qty: { fontSize: 15, fontFamily: fonts.bodyBold, color: colors.text, minWidth: 22, textAlign: "center" },
  remove: { marginLeft: "auto" },
  removeText: { fontSize: 12, fontFamily: fonts.bodySemi, color: colors.terracotta },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, padding: 16, backgroundColor: "rgba(248,245,238,0.96)" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  totalLabel: { fontSize: 16, fontFamily: fonts.bodySemi, color: colors.muted },
  totalValue: { fontSize: 22, fontFamily: fonts.heading, color: colors.forest },
  clear: { textAlign: "center", fontSize: 13, fontFamily: fonts.bodySemi, color: colors.muted },
});
