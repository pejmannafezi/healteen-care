import { useEffect, useState } from "react";
import { ScrollView, View, Text, Image, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { fetchCondition, type Condition, type ConditionProduct } from "../lib/conditions";
import { formatPrice } from "../lib/format";
import { colors, fonts } from "../lib/theme";

export function ConditionScreen({
  id,
  onBack,
  onOpenProduct,
}: {
  id: string;
  onBack: () => void;
  onOpenProduct: (productId: string) => void;
}) {
  const [data, setData] = useState<{ condition: Condition; products: ConditionProduct[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCondition(id)
      .then((d) => active && setData(d))
      .catch(() => active && setData(null))
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

  if (!data) {
    return (
      <View style={styles.center}>
        <Pressable onPress={onBack}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={{ color: colors.muted, marginTop: 16, fontFamily: fonts.body }}>Not found.</Text>
      </View>
    );
  }

  const { condition, products } = data;
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
      <Pressable onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>‹ Back to Health Library</Text>
      </Pressable>
      {condition.image_url ? (
        <Image source={{ uri: condition.image_url }} style={styles.hero} resizeMode="cover" />
      ) : null}
      <View style={styles.body}>
        <Text style={styles.name}>{condition.name}</Text>
        {condition.description ? <Text style={styles.para}>{condition.description}</Text> : null}

        <Section title="Symptoms" text={condition.symptoms} />
        <Section title="How to use" text={condition.usage_notes} />
        <Section title="Who should not use it" text={condition.who_should_not_use} />

        {products.length > 0 && (
          <View style={{ marginTop: 22 }}>
            <Text style={styles.h2}>May be supported by</Text>
            {products.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => onOpenProduct(p.id)}
                style={({ pressed }) => [styles.prod, pressed && { opacity: 0.9 }]}
              >
                {p.images?.[0] ? (
                  <Image source={{ uri: p.images[0] }} style={styles.prodImg} />
                ) : (
                  <View style={[styles.prodImg, { backgroundColor: colors.cream }]} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.prodName}>{p.name}</Text>
                  <Text style={styles.prodPrice}>{formatPrice(p.price_cents, p.currency)}</Text>
                </View>
                <Text style={styles.chev}>›</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.disclaimer}>
          Educational information only — not medical advice. Talk to a healthcare professional
          before starting any new supplement.
        </Text>
      </View>
    </ScrollView>
  );
}

function Section({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={styles.h2}>{title}</Text>
      <Text style={styles.para}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  back: { paddingHorizontal: 16, paddingVertical: 12 },
  backText: { color: colors.nature, fontFamily: fonts.bodyBold, fontSize: 15 },
  hero: { width: "100%", height: 220, backgroundColor: colors.cream },
  body: { padding: 16 },
  name: { fontSize: 26, fontFamily: fonts.heading, color: colors.forest, lineHeight: 32 },
  para: { fontSize: 15, lineHeight: 22, fontFamily: fonts.body, color: colors.text, marginTop: 8 },
  h2: { fontSize: 17, fontFamily: fonts.headingSemi, color: colors.forest },
  prod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginTop: 10,
  },
  prodImg: { width: 52, height: 52, borderRadius: 8 },
  prodName: { fontSize: 14, fontFamily: fonts.headingSemi, color: colors.forest },
  prodPrice: { fontSize: 13, fontFamily: fonts.bodyBold, color: colors.forest, marginTop: 2 },
  chev: { fontSize: 22, color: colors.forest, paddingHorizontal: 4 },
  disclaimer: { fontSize: 12, fontFamily: fonts.body, color: colors.muted, marginTop: 24, lineHeight: 18 },
});
