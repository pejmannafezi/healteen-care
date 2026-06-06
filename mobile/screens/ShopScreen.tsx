import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl } from "react-native";
import { fetchProducts, type ProductCard as ProductCardType } from "../lib/catalog";
import { ProductCard } from "../components/ProductCard";
import { colors } from "../lib/theme";

export function ShopScreen({ onOpenProduct }: { onOpenProduct: (id: string) => void }) {
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setProducts(await fetchProducts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.forest} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Shop</Text>
          <Text style={styles.title}>Lab-tested herbal products</Text>
        </View>
      }
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={() => onOpenProduct(item.id)} />
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={colors.forest}
        />
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={{ color: colors.muted }}>{error ?? "No products yet."}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, minHeight: 200 },
  list: { padding: 16 },
  header: { marginBottom: 16 },
  eyebrow: { fontSize: 12, fontWeight: "700", letterSpacing: 1, color: colors.nature, textTransform: "uppercase" },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, marginTop: 4 },
});
