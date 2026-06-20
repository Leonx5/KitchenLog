import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Monitor, Wifi, TrendingUp, DollarSign,
  Smartphone, Printer, CheckCircle, AlertTriangle,
  Activity, Zap, Clock, ChevronRight
} from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';

const DARK_FOREST = '#0F1A15';
const IVORY = '#FDFCFB';
const DARK_OLIVE = '#1C2620';
const SOFT_SAND = 'rgba(212, 163, 115, 0.9)';

const MOCK_SALES = [
  { id: 1, item: 'Grilled Chicken Plate', amount: 1850, time: '2m ago', terminal: 'Front #1' },
  { id: 2, item: 'Beef Stew + Rice', amount: 2200, time: '5m ago', terminal: 'Bar #2' },
  { id: 3, item: 'Vegetable Curry', amount: 1200, time: '8m ago', terminal: 'Front #1' },
  { id: 4, item: 'Grilled Tilapia', amount: 1600, time: '12m ago', terminal: 'KDS #3' },
  { id: 5, item: 'Chicken Wrap x2', amount: 1800, time: '18m ago', terminal: 'Bar #2' },
  { id: 6, item: 'Spaghetti Bolognese', amount: 1500, time: '25m ago', terminal: 'Front #1' },
  { id: 7, item: 'Beef Burger + Fries', amount: 1400, time: '30m ago', terminal: 'KDS #3' },
  { id: 8, item: 'Breakfast Omelette', amount: 900, time: '45m ago', terminal: 'Bar #2' },
];

const MOCK_TERMINALS = [
  { id: 1, name: 'Front Register #1', type: 'Register', status: 'online', ip: '192.168.1.101' },
  { id: 2, name: 'Bar Terminal #2', type: 'Register', status: 'online', ip: '192.168.1.102' },
  { id: 3, name: 'Kitchen Display #3', type: 'KDS', status: 'online', ip: '192.168.1.103' },
  { id: 4, name: 'Back Office #4', type: 'Workstation', status: 'offline', ip: '192.168.1.104' },
  { id: 5, name: 'Receipt Printer #1', type: 'Printer', status: 'online', ip: '192.168.1.201' },
];

const NETWORK_METRICS = [
  { label: 'Uptime', value: '99.8%', trend: 'stable' },
  { label: 'Latency', value: '12ms', trend: 'good' },
  { label: 'Devices Online', value: '4/5', trend: 'warning' },
  { label: 'Today\'s Sales', value: 'KSh 12,450', trend: 'up' },
];

function PulseDot({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 2, duration: 2000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ width: 8, height: 8, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={{
        position: 'absolute', width: 8, height: 8, borderRadius: 4,
        backgroundColor: color, opacity, transform: [{ scale }],
      }} />
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
    </View>
  );
}

function SectionHeader({ title, icon: Icon, tint }: { title: string; icon: any; tint?: string }) {
  return (
    <View style={s.sectionHeaderRow}>
      <View style={s.sectionDot} />
      <Icon size={12} color={tint ?? Colors.accent} style={{ marginRight: 8 }} />
      <Text style={s.sectionLabel}>{title.toUpperCase()}</Text>
    </View>
  );
}

function TerminalCard({ terminal }: { terminal: typeof MOCK_TERMINALS[0] }) {
  const isOnline = terminal.status === 'online';
  const iconMap: Record<string, any> = {
    Register: Monitor, KDS: Smartphone, Workstation: Monitor, Printer: Printer,
  };
  const Icon = iconMap[terminal.type] ?? Monitor;

  return (
    <View style={s.terminalCard}>
      <View style={s.terminalIconWrap}>
        <Icon size={16} color={isOnline ? '#4ADE80' : '#6B7280'} />
      </View>
      <View style={s.terminalInfo}>
        <View style={s.terminalNameRow}>
          <Text style={s.terminalName}>{terminal.name}</Text>
          {isOnline ? <PulseDot color="#4ADE80" /> : <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#6B7280' }} />}
        </View>
        <Text style={s.terminalMeta}>{terminal.type} · {terminal.ip}</Text>
      </View>
      <Text style={[s.terminalStatus, { color: isOnline ? '#4ADE80' : '#6B7280' }]}>
        {isOnline ? 'Online' : 'Offline'}
      </Text>
    </View>
  );
}

function SaleRow({ sale }: { sale: typeof MOCK_SALES[0] }) {
  return (
    <View style={s.saleRow}>
      <View style={s.saleIcon}>
        <DollarSign size={12} color={Colors.accent} />
      </View>
      <View style={s.saleInfo}>
        <View style={s.saleNameRow}>
          <Text style={s.saleItemName}>{sale.item}</Text>
          <Text style={s.saleAmount}>KSh {sale.amount.toLocaleString()}</Text>
        </View>
        <Text style={s.saleMeta}>{sale.terminal} · {sale.time}</Text>
      </View>
    </View>
  );
}

function MetricTile({ metric }: { metric: typeof NETWORK_METRICS[0] }) {
  const accentColor =
    metric.trend === 'up' ? '#4ADE80' :
    metric.trend === 'warning' ? Colors.accent :
    metric.trend === 'good' ? '#4ADE80' : IVORY;

  return (
    <View style={s.metricTile}>
      <Text style={[s.metricValue, { color: accentColor }]}>{metric.value}</Text>
      <Text style={s.metricLabel}>{metric.label}</Text>
    </View>
  );
}

function LiveSalesBadge() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Animated.View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#4ADE80', opacity: pulse }} />
      <Text style={{ color: '#4ADE80', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 }}>LIVE</Text>
    </View>
  );
}

export default function POSConnectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const totalSales = MOCK_SALES.reduce((sum, s) => sum + s.amount, 0);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={20} color={Colors.accent} />
        </TouchableOpacity>
        <View style={s.headerTitles}>
          <Text style={s.headerTitle}>POS Connect</Text>
          <Text style={s.headerSub}>Point of Sale Integration</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Network Health Section */}
        <View style={s.section}>
          <SectionHeader title="Network Health" icon={Activity} />
          <View style={s.metricsGrid}>
            {NETWORK_METRICS.map((m, i) => (
              <MetricTile key={i} metric={m} />
            ))}
          </View>
        </View>

        {/* Connected Devices Section */}
        <View style={s.section}>
          <SectionHeader title="Connected Devices" icon={Monitor} />
          <View style={s.terminalList}>
            {MOCK_TERMINALS.map((t) => (
              <TerminalCard key={t.id} terminal={t} />
            ))}
          </View>
          <View style={s.statusBar}>
            <CheckCircle size={14} color="#4ADE80" />
            <Text style={s.statusBarText}>4 of 5 devices online</Text>
          </View>
        </View>

        {/* Live Sales Feed Section */}
        <View style={s.section}>
          <View style={[s.sectionHeaderRow, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={s.sectionDot} />
              <TrendingUp size={12} color={Colors.accent} style={{ marginRight: 8 }} />
              <Text style={s.sectionLabel}>SALES FEED</Text>
            </View>
            <LiveSalesBadge />
          </View>
          <View style={s.salesSummary}>
            <Text style={s.salesSummaryLabel}>Today's Revenue</Text>
            <Text style={s.salesSummaryValue}>KSh {totalSales.toLocaleString()}</Text>
            <Text style={s.salesSummarySub}>{MOCK_SALES.length} transactions</Text>
          </View>
          <View style={s.salesList}>
            {MOCK_SALES.map((sale) => (
              <SaleRow key={sale.id} sale={sale} />
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={s.demoBadge}>
          <Zap size={14} color={Colors.accent} />
          <Text style={s.demoBadgeText}>Demonstration Mode — No live integrations active</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
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
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionHeaderRow: {
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricTile: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    color: IVORY,
    fontSize: 10,
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  terminalList: {
    gap: 8,
  },
  terminalCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
  },
  terminalIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 163, 115, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  terminalInfo: {
    flex: 1,
  },
  terminalNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  terminalName: {
    color: IVORY,
    fontSize: 14,
    fontWeight: '600',
  },
  terminalMeta: {
    color: IVORY,
    fontSize: 10,
    opacity: 0.35,
    marginTop: 2,
  },
  terminalStatus: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(74, 222, 128, 0.06)',
    borderRadius: 8,
  },
  statusBarText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '600',
  },
  salesSummary: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
  },
  salesSummaryLabel: {
    color: IVORY,
    fontSize: 10,
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  salesSummaryValue: {
    color: IVORY,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  salesSummarySub: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
    marginTop: 2,
  },
  salesList: {
    gap: 1,
  },
  saleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 163, 115, 0.05)',
  },
  saleIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  saleInfo: {
    flex: 1,
  },
  saleNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saleItemName: {
    color: IVORY,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  saleAmount: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  saleMeta: {
    color: IVORY,
    fontSize: 10,
    opacity: 0.3,
    marginTop: 2,
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 163, 115, 0.06)',
  },
  demoBadgeText: {
    color: SOFT_SAND,
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.6,
  },
});
