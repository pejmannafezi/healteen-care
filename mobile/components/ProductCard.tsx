import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import { colors } from "../lib/theme";
import { formatPrice } from "../lib/format";
import type { ProductCard as ProductCardType } from "../lib/catalog";

export function ProductCard({
  product,
  onPress,
}: {
  product: ProductCardType;
  onPress: () => void;
}) {
  const img = product.images?.[0];
  const out = product.stock_qty <= 0;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={styles.imgWrap}>
        {img ? (
          <Image source={{ uri: img }} style={styles.img} resizeMode="cover" />
        ) : (
          <View style={[styles.img, styles.placeholder]}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>No image</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        {product.short_description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {product.short_description}
          </Text>
        ) : null}
        <View style={styles.row}>
          <Text style={styles.price}>{formatPrice(product.price_cents, product.currency)}</Text>
          <Text style={[styles.stock, { color: out ? colors.gold : colors.nature }]}>
            {out ? "Out of stock" : `${product.stock_qty} in stock`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 12,
  },
  imgWrap: { width: 104, height: 104, backgroundColor: colors.cream },
  img: { width: "100%", height: "100%" },
  placeholder: { alignItems: "center", justifyContent: "center" },
  body: { flex: 1, padding: 12, justifyContent: "space-between" },
  name: { fontSize: 15, fontWeight: "700", color: colors.text },
  desc: { fontSize: 12, color: colors.muted, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  price: { fontSize: 16, fontWeight: "800", color: colors.forest },
  stock: { fontSize: 11, fontWeight: "600" },
});
