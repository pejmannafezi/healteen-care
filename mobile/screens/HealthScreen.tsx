import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { fetchConditions, type Condition } from "../lib/conditions";
import { colors, fonts } from "../lib/theme";

export function HealthScreen({ onOpenCondition }: { onOpenCondition: (id: string) => void }) {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConditions()
      .then(setConditions)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.forest} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={conditions}
      keyExtractor={(c) => c.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Learn</Text>
          <Text style={styles.title}>Health Library</Text>
          <Text style={styles.sub}>
            Which herbal options may support common needs — and who should avoid them.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onOpenCondition(item.id)}
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
        >
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.img} />
          ) : (
            <View style={[styles.img, styles.placeholder]} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.desc} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
          </View>
          <Text style={styles.chev}>›</Text>
        </Pressable>
      )}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={{ color: colors.muted, fontFamily: fonts.body }}>
            {error ?? "No articles yet."}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, minHeight: 200 },
  list: { padding: 16 },
  header: { marginBottom: 12 },
  eyebrow: { fontSize: 12, fontFamily: fonts.bodySemi, letterSpacing: 1, color: colors.nature, textTransform: "uppercase" },
  title: { fontSize: 30, fontFamily: fonts.heading, color: colors.forest, marginTop: 4 },
  sub: { fontSize: 14, fontFamily: fonts.body, color: colors.muted, marginTop: 6 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 10,
  },
  img: { width: 64, height: 64, borderRadius: 10, backgroundColor: colors.cream },
  placeholder: { backgroundColor: colors.cream },
  name: { fontSize: 16, fontFamily: fonts.headingSemi, color: colors.forest },
  desc: { fontSize: 12, fontFamily: fonts.body, color: colors.muted, marginTop: 2 },
  chev: { fontSize: 24, color: colors.forest, paddingHorizontal: 4 },
});
