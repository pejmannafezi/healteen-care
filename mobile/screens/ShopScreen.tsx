import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import {
  fetchProducts,
  fetchProductTypes,
  fetchHealthNeeds,
  fetchProductsByCategory,
  fetchProductsByNeed,
  type ProductCard as ProductCardType,
  type Taxonomy,
} from "../lib/catalog";
import { ProductCard } from "../components/ProductCard";
import { colors, fonts } from "../lib/theme";

type Filter = { kind: "type" | "need"; id: string; name: string } | null;

export function ShopScreen({ onOpenProduct }: { onOpenProduct: (id: string) => void }) {
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [types, setTypes] = useState<Taxonomy[]>([]);
  const [needs, setNeeds] = useState<Taxonomy[]>([]);
  const [filter, setFilter] = useState<Filter>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setError(null);
      const [p, t, n] = await Promise.all([
        fetchProducts(),
        fetchProductTypes(),
        fetchHealthNeeds(),
      ]);
      setProducts(p);
      setTypes(t);
      setNeeds(n);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const applyFilter = useCallback(async (next: Filter) => {
    setFilter(next);
    setLoading(true);
    try {
      setError(null);
      if (!next) setProducts(await fetchProducts());
      else if (next.kind === "type") setProducts(await fetchProductsByCategory(next.id));
      else setProducts(await fetchProductsByNeed(next.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  const Header = (
    <View>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Shop</Text>
        <Text style={styles.title}>Lab-tested herbal products</Text>
      </View>

      <Text style={styles.section}>Shop by Product Type</Text>
      <ChipRow
        items={types}
        activeId={filter?.kind === "type" ? filter.id : null}
        onPick={(t) => applyFilter({ kind: "type", id: t.id, name: t.name })}
      />

      <Text style={styles.section}>Shop by Health Need</Text>
      <ChipRow
        items={needs}
        activeId={filter?.kind === "need" ? filter.id : null}
        onPick={(n) => applyFilter({ kind: "need", id: n.id, name: n.name })}
      />

      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>{filter ? filter.name : "All Products"}</Text>
        {filter && (
          <Pressable onPress={() => applyFilter(null)}>
            <Text style={styles.clear}>Show all</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={Header}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <View style={styles.center}>
            <ActivityIndicator color={colors.forest} size="large" />
          </View>
        }
      />
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={Header}
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={() => onOpenProduct(item.id)} />
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setFilter(null);
            loadAll();
          }}
          tintColor={colors.forest}
        />
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={{ color: colors.muted, fontFamily: fonts.body }}>
            {error ?? "No products here yet."}
          </Text>
        </View>
      }
    />
  );
}

function ChipRow({
  items,
  activeId,
  onPick,
}: {
  items: Taxonomy[];
  activeId: string | null;
  onPick: (t: Taxonomy) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {items.map((it) => {
        const active = it.id === activeId;
        return (
          <Pressable
            key={it.id}
            onPress={() => onPick(it)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{it.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", padding: 40, minHeight: 160 },
  list: { padding: 16 },
  header: { marginBottom: 8 },
  eyebrow: { fontSize: 12, fontFamily: fonts.bodySemi, letterSpacing: 1, color: colors.nature, textTransform: "uppercase" },
  title: { fontSize: 30, fontFamily: fonts.heading, color: colors.forest, marginTop: 4, lineHeight: 36 },
  section: { fontSize: 17, fontFamily: fonts.headingSemi, color: colors.forest, marginTop: 18, marginBottom: 8 },
  chipRow: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { fontSize: 13, fontFamily: fonts.bodySemi, color: colors.forest },
  chipTextActive: { color: colors.cream },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 10,
  },
  resultLabel: { fontSize: 18, fontFamily: fonts.heading, color: colors.text },
  clear: { fontSize: 13, fontFamily: fonts.bodySemi, color: colors.nature },
});
