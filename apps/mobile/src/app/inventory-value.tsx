import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, Package, DollarSign, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { getInventory, getIngredients } from '@/utils/database';

const DARK_FOREST = '#0F1A15';
const IVORY = '#FDFCFB';
const DARK_OLIVE = '#1C2620';
const SOFT_SAND = 'rgba(212, 163, 115, 0.9)';
const MUTED_GREEN = '#6BBF8A';

type ItemDetail = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalValue: number;
  percentage: number;
};

export default function InventoryValueScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [items, setItems] = useState<ItemDetail[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      try {
        const inv = getInventory();
        const ingredients = getIngredients();
        const costMap: Record<number, { cost_per_unit: number; name: string; category: string | null; unit: string | null }> = {};
        for (const ing of ingredients) {
          costMap[ing.id] = ing;
        }

        const details: ItemDetail[] = [];
        let total = 0;
        for (const item of inv) {
          const ingInfo = item.ingredient_id ? costMap[item.ingredient_id] : null;
          if (ingInfo) {
            const val = item.quantity * ingInfo.cost_per_unit;
            total += val;
            details.push({
              name: ingInfo.name,
              category: ingInfo.category || 'General',
              quantity: item.quantity,
              unit: ingInfo.unit || 'unit',
              costPerUnit: ingInfo.cost_per_unit,
              totalValue: Math.round(val),
              percentage: 0,
            });
          }
        }

        for (const d of details) {
          d.percentage = total > 0 ? Math.round((d.totalValue / total) * 100) : 0;
        }

        details.sort((a, b) => b.totalValue - a.totalValue);
        setTotalValue(Math.round(total));
        setItems(details);
      } catch {
        setItems([]);
        setTotalValue(0);
      }
    }, [])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.accent} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Inventory Value</Text>
          <Text style={styles.headerSub}>Item breakdown & contribution</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Value Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconWrap}>
            <DollarSign size={28} color={DARK_FOREST} />
          </View>
          <Text style={styles.heroTotal}>KSh {totalValue.toLocaleString()}</Text>
          <Text style={styles.heroLabel}>TOTAL INVENTORY VALUE</Text>
          <Text style={styles.heroCount}>{items.length} items tracked</Text>
        </View>

        {/* Breakdown */}
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={32} color={IVORY} opacity={0.15} />
            <Text style={styles.emptyText}>No inventory items</Text>
            <Text style={styles.emptyHint}>Add items to see value breakdown</Text>
          </View>
        ) : (
          <View style={styles.breakdownSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionLabel}>ITEM BREAKDOWN</Text>
            </View>
            {items.map((item, i) => (
              <View key={i} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemIconWrap}>
                    <Package size={14} color={Colors.accent} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                  </View>
                  <View style={styles.itemValue}>
                    <Text style={styles.itemValueText}>KSh {item.totalValue.toLocaleString()}</Text>
                    <Text style={styles.itemPercent}>{item.percentage}%</Text>
                  </View>
                </View>

                <View style={styles.itemBar}>
                  <View style={[styles.itemBarFill, { width: `${item.percentage}%` }]} />
                </View>

                <View style={styles.itemMeta}>
                  <Text style={styles.metaText}>{item.quantity} {item.unit} × KSh {item.costPerUnit}/{item.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_FOREST,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 163, 115, 0.1)',
  },
  backBtn: {
    padding: 4,
    marginRight: 14,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    color: IVORY,
    fontSize: 20,
    fontWeight: '700',
  },
  headerSub: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
    marginTop: 1,
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(107, 191, 138, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTotal: {
    fontSize: 34,
    fontWeight: '700',
    color: MUTED_GREEN,
    letterSpacing: -0.3,
  },
  heroLabel: {
    fontSize: 9,
    color: IVORY,
    opacity: 0.35,
    letterSpacing: 1.8,
    marginTop: 8,
  },
  heroCount: {
    fontSize: 11,
    color: IVORY,
    opacity: 0.25,
    marginTop: 4,
  },
  breakdownSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
    marginRight: 10,
  },
  sectionLabel: {
    color: SOFT_SAND,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    opacity: 0.8,
  },
  itemCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: IVORY,
    fontSize: 15,
    fontWeight: '600',
  },
  itemCategory: {
    color: IVORY,
    fontSize: 10,
    opacity: 0.35,
    marginTop: 1,
  },
  itemValue: {
    alignItems: 'flex-end',
  },
  itemValueText: {
    color: MUTED_GREEN,
    fontSize: 13,
    fontWeight: '600',
  },
  itemPercent: {
    color: IVORY,
    fontSize: 10,
    opacity: 0.35,
    marginTop: 1,
  },
  itemBar: {
    height: 4,
    backgroundColor: 'rgba(15, 26, 21, 0.5)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  itemBarFill: {
    height: '100%',
    backgroundColor: 'rgba(107, 191, 138, 0.4)',
    borderRadius: 2,
  },
  itemMeta: {
    marginTop: 2,
  },
  metaText: {
    color: IVORY,
    fontSize: 10,
    opacity: 0.25,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    color: IVORY,
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.3,
  },
  emptyHint: {
    color: IVORY,
    fontSize: 12,
    opacity: 0.2,
  },
});
