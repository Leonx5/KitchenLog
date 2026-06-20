import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, AlertTriangle, Package, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { getInventoryAlerts, getInventoryAlertCounts } from '@/utils/database';

const DARK_FOREST = '#0F1A15';
const IVORY = '#FDFCFB';
const DARK_OLIVE = '#1C2620';

type AlertItem = {
  id: number;
  name: string;
  quantity: number;
  minimum_quantity: number;
  unit: string | null;
  status: string;
  type: 'critical' | 'restock';
};

function AlertRow({ item }: { item: AlertItem }) {
  const isCritical = item.type === 'critical';
  const pct = item.minimum_quantity > 0
    ? Math.round((item.quantity / item.minimum_quantity) * 100)
    : 0;

  return (
    <View style={styles.alertRow}>
      <View style={styles.alertIconWrap}>
        <Package size={14} color={isCritical ? '#FF6B6B' : Colors.accent} />
      </View>
      <View style={styles.alertInfo}>
        <Text style={styles.alertName}>{item.name}</Text>
        <Text style={styles.alertMeta}>
          {item.quantity} / {item.minimum_quantity} {item.unit ?? ''}
        </Text>
      </View>
      <View style={styles.alertRight}>
        <View style={[styles.bar, { backgroundColor: 'rgba(253,252,251,0.06)' }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(pct, 100)}%`,
                backgroundColor: isCritical ? '#FF6B6B' : Colors.accent,
              },
            ]}
          />
        </View>
        <Text style={[styles.alertPct, { color: isCritical ? '#FF6B6B' : Colors.accent }]}>
          {pct}%
        </Text>
      </View>
    </View>
  );
}

export default function InventoryAlertsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [critical, setCritical] = useState<AlertItem[]>([]);
  const [restock, setRestock] = useState<AlertItem[]>([]);
  const [counts, setCounts] = useState({ total: 0, critical: 0, restock: 0 });

  useEffect(() => {
    const all = getInventoryAlerts() as AlertItem[];
    setCritical(all.filter((a) => a.type === 'critical'));
    setRestock(all.filter((a) => a.type === 'restock'));
    setCounts(getInventoryAlertCounts());
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.accent} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Inventory Alerts</Text>
          <Text style={styles.headerSub}>
            {counts.critical} critical · {counts.restock} to restock
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <AlertTriangle size={12} color={Colors.accent} />
          <Text style={styles.headerBadgeText}>{counts.total}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {critical.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.sectionTitle}>Critical</Text>
              <Text style={styles.sectionCount}>{critical.length}</Text>
            </View>
            <View style={styles.card}>
              {critical.map((item) => (
                <AlertRow key={item.id} item={item} />
              ))}
            </View>
          </View>
        )}

        {restock.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: Colors.accent }]} />
              <Text style={styles.sectionTitle}>Restock Soon</Text>
              <Text style={styles.sectionCount}>{restock.length}</Text>
            </View>
            <View style={styles.card}>
              {restock.map((item) => (
                <AlertRow key={item.id} item={item} />
              ))}
            </View>
          </View>
        )}

        {counts.total === 0 && (
          <View style={styles.empty}>
            <Package size={32} color={IVORY} opacity={0.15} />
            <Text style={styles.emptyText}>No inventory alerts</Text>
            <Text style={styles.emptySub}>All stock levels are healthy</Text>
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
  headerTitle: {
    color: IVORY,
    fontSize: 20,
    fontWeight: '700',
  },
  headerSub: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
    marginTop: 1,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerBadgeText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  sectionTitle: {
    color: IVORY,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
  },
  sectionCount: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
  },
  card: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
    overflow: 'hidden',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 163, 115, 0.05)',
  },
  alertIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 163, 115, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertName: {
    color: IVORY,
    fontSize: 14,
    fontWeight: '600',
  },
  alertMeta: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.4,
    marginTop: 2,
  },
  alertRight: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: 12,
  },
  bar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  alertPct: {
    fontSize: 10,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    color: IVORY,
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.5,
  },
  emptySub: {
    color: IVORY,
    fontSize: 12,
    opacity: 0.25,
  },
});
