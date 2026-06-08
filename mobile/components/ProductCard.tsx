import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import { colors, fonts } from "../lib/theme";
import { formatPrice } from "../lib/format";
import { useCart } from "../lib/cart";
import type { ProductCard as ProductCardType } from "../lib/catalog";

export function ProductCard({
  product,
  onPress,
}: {
  product: ProductCardType;
  onPress: () => void;
}) {
  const { add } = useCart();
  const img = product.images?.[0];
  const out = product.stock_qty <= 0;

  const addToCart = () =>
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.price_cents,
      currency: product.currency,
      image: img,
    });
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
        {!out && (
          <Pressable
            onPress={addToCart}
            hitSlop={6}
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.addText}>Add to cart</Text>
          </Pressable>
        )}
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
  name: { fontSize: 16, fontFamily: fonts.headingSemi, color: colors.forest },
  desc: { fontSize: 12, fontFamily: fonts.body, color: colors.muted, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  price: { fontSize: 16, fontFamily: fonts.bodyBold, color: colors.forest },
  stock: { fontSize: 11, fontFamily: fonts.bodySemi },
  addBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: colors.forest,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addText: { fontSize: 12, fontFamily: fonts.bodyBold, color: colors.cream },
});
