import { useEffect, useState } from "react";
import { ScrollView, View, Text, Image, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import { fetchProduct, type Product } from "../lib/catalog";
import { formatPrice } from "../lib/format";
import { useCart } from "../lib/cart";
import { Button } from "../components/Button";
import { colors, fonts } from "../lib/theme";

export function ProductScreen({ id, onBack }: { id: string; onBack: () => void }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  useEffect(() => {
    let active = true;
    fetchProduct(id)
      .then((p) => active && setProduct(p))
      .catch(() => active && setProduct(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.forest} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Pressable onPress={onBack}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={{ color: colors.muted, marginTop: 16 }}>Product not found.</Text>
      </View>
    );
  }

  const img = product.images?.[0];
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
      <Pressable onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>‹ Back to shop</Text>
      </Pressable>
      {img ? <Image source={{ uri: img }} style={styles.hero} resizeMode="cover" /> : null}
      <View style={styles.body}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatPrice(product.price_cents, product.currency)}</Text>
        {product.size ? <Text style={styles.size}>{product.size}</Text> : null}
        {product.short_description ? <Text style={styles.para}>{product.short_description}</Text> : null}

        <View style={{ marginTop: 16 }}>
          <Button
            title={added ? "Added to cart ✓" : "Add to cart"}
            onPress={() => {
              add({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.price_cents,
                currency: product.currency,
                image: product.images?.[0],
              });
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
          />
        </View>

        <Section title="Benefits" text={product.benefits} />
        <Section title="How to use" text={product.how_to_use} />
        <Section title="Who should not use it" text={product.contraindications} />
        <Section title="Ingredients" text={product.ingredients} />
      </View>
    </ScrollView>
  );
}

function Section({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.h2}>{title}</Text>
      <Text style={styles.para}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  back: { paddingHorizontal: 16, paddingVertical: 12 },
  backText: { color: colors.nature, fontFamily: fonts.bodyBold, fontSize: 15 },
  hero: { width: "100%", height: 280, backgroundColor: colors.cream },
  body: { padding: 16 },
  name: { fontSize: 26, fontFamily: fonts.heading, color: colors.forest, lineHeight: 32 },
  price: { fontSize: 20, fontFamily: fonts.bodyBold, color: colors.forest, marginTop: 6 },
  size: { fontSize: 13, fontFamily: fonts.body, color: colors.muted, marginTop: 2 },
  para: { fontSize: 15, lineHeight: 22, fontFamily: fonts.body, color: colors.text, marginTop: 8 },
  h2: { fontSize: 17, fontFamily: fonts.headingSemi, color: colors.forest },
});
