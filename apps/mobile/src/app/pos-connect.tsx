import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Wifi, CheckCircle, Activity, Zap, ChevronRight, Monitor, Smartphone, Globe, DollarSign, TrendingUp, ShoppingCart, BarChart3, RefreshCw, Calendar, Package, FileText } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';

const DARK_FOREST = '#0F1A15';
const IVORY = '#FDFCFB';
const DARK_OLIVE = '#1C2620';
const SOFT_SAND = 'rgba(212, 163, 115, 0.9)';

type PosProvider = {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
};

const POS_PROVIDERS: PosProvider[] = [
  { id: 'toast', name: 'Toast POS', icon: Monitor, description: 'Cloud-based restaurant POS', color: '#4ADE80' },
  { id: 'oracle', name: 'Oracle Micros', icon: Monitor, description: 'Enterprise hospitality suite', color: '#E9C46A' },
  { id: 'square', name: 'Square', icon: Smartphone, description: 'Integrated payments & POS', color: '#4ADE80' },
  { id: 'lightspeed', name: 'Lightspeed', icon: Globe, description: 'All-in-one commerce platform', color: Colors.accent },
  { id: 'custom', name: 'Custom POS', icon: Wifi, description: 'Connect via open API', color: '#FF8C00' },
];

const STEPS = ['Connecting...', 'Syncing menu items...', 'Syncing inventory...', 'Ready'];

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

type MetricCardProps = {
  icon: any;
  label: string;
  value: string;
  accent: string;
};

function MetricCard({ icon: Icon, label, value, accent }: MetricCardProps) {
  return (
    <View style={s.metricCard}>
      <View style={[s.metricIconWrap, { backgroundColor: `${accent}15` }]}>
        <Icon size={16} color={accent} />
      </View>
      <Text style={[s.metricValue, { color: accent }]}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
    </View>
  );
}

export default function POSConnectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);

  useEffect(() => {
    if (selectedProvider && stepIndex >= 0 && stepIndex < STEPS.length - 1) {
      const timer = setTimeout(() => setStepIndex(stepIndex + 1), 1500);
      return () => clearTimeout(timer);
    }
  }, [selectedProvider, stepIndex]);

  const handleConnect = (id: string) => {
    setSelectedProvider(id);
    setStepIndex(0);
  };

  const selected = POS_PROVIDERS.find(p => p.id === selectedProvider);
  const isComplete = stepIndex === STEPS.length - 1;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={20} color={Colors.accent} />
        </TouchableOpacity>
        <View style={s.headerTitles}>
          <Text style={s.headerTitle}>POS Control Center</Text>
          <Text style={s.headerSub}>Point of Sale Integration & Operations</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* POS Provider Selection */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <View style={s.sectionDot} />
            <Activity size={12} color={Colors.accent} style={{ marginRight: 8 }} />
            <Text style={s.sectionLabel}>CONNECTED PROVIDER</Text>
          </View>
          <View style={s.providerList}>
            {POS_PROVIDERS.map((provider) => {
              const isSelected = selectedProvider === provider.id;
              return (
                <TouchableOpacity
                  key={provider.id}
                  style={[s.providerCard, isSelected && s.providerCardSelected]}
                  onPress={() => handleConnect(provider.id)}
                  activeOpacity={0.7}
                >
                  <View style={[s.providerIconWrap, { backgroundColor: `${provider.color}15` }]}>
                    <provider.icon size={18} color={provider.color} />
                  </View>
                  <View style={s.providerInfo}>
                    <Text style={s.providerName}>{provider.name}</Text>
                    <Text style={s.providerDesc}>{provider.description}</Text>
                  </View>
                  {!isSelected && <ChevronRight size={14} color={IVORY} opacity={0.2} />}
                  {isSelected && isComplete && <CheckCircle size={16} color="#4ADE80" />}
                  {isSelected && !isComplete && <PulseDot color={Colors.accent} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Integration Workflow */}
        {selectedProvider && (
          <View style={s.section}>
            <View style={s.sectionHeaderRow}>
              <View style={s.sectionDot} />
              <Zap size={12} color={Colors.accent} style={{ marginRight: 8 }} />
              <Text style={s.sectionLabel}>INTEGRATION STATUS</Text>
            </View>
            <View style={s.workflowCard}>
              <View style={s.workflowHeader}>
                <Text style={s.workflowTitle}>{selected!.name}</Text>
                {isComplete && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={12} color="#4ADE80" />
                    <Text style={{ color: '#4ADE80', fontSize: 10, fontWeight: '700' }}>CONNECTED</Text>
                  </View>
                )}
                {!isComplete && <PulseDot color={Colors.accent} />}
              </View>
              <View style={s.stepsList}>
                {STEPS.map((step, i) => {
                  const isActive = i === stepIndex;
                  const isDone = i < stepIndex;
                  return (
                    <View key={i} style={s.stepRow}>
                      <View style={s.stepIndicator}>
                        {isDone ? (
                          <CheckCircle size={14} color="#4ADE80" />
                        ) : isActive ? (
                          <Activity size={14} color={Colors.accent} />
                        ) : (
                          <View style={s.stepDot} />
                        )}
                      </View>
                      <Text style={[s.stepText, (isActive || isDone) && s.stepTextActive]}>
                        {step}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Business Metrics Overview */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <View style={s.sectionDot} />
            <BarChart3 size={12} color={Colors.accent} style={{ marginRight: 8 }} />
            <Text style={s.sectionLabel}>BUSINESS OVERVIEW</Text>
          </View>
          <View style={s.metricsGrid}>
            <MetricCard icon={ShoppingCart} label="Goods Sold" value="1,247" accent="#4ADE80" />
            <MetricCard icon={DollarSign} label="Total Sales" value="KSh 342K" accent={Colors.accent} />
            <MetricCard icon={RefreshCw} label="Transactions" value="843" accent="#E9C46A" />
            <MetricCard icon={TrendingUp} label="Revenue" value="KSh 89K" accent="#FF8C00" />
          </View>
        </View>

        {/* Operational Tools */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <View style={s.sectionDot} />
            <Zap size={12} color={Colors.accent} style={{ marginRight: 8 }} />
            <Text style={s.sectionLabel}>OPERATIONAL TOOLS</Text>
          </View>
          <View style={s.toolsGrid}>
            <TouchableOpacity style={s.toolCard} activeOpacity={0.7}>
              <View style={[s.toolIconWrap, { backgroundColor: 'rgba(74, 222, 128, 0.1)' }]}>
                <RefreshCw size={16} color="#4ADE80" />
              </View>
              <View style={s.toolInfo}>
                <Text style={s.toolName}>Sync Inventory</Text>
                <Text style={s.toolDesc}>Push stock levels to POS</Text>
              </View>
              <ChevronRight size={14} color={IVORY} opacity={0.2} />
            </TouchableOpacity>
            <TouchableOpacity style={s.toolCard} activeOpacity={0.7}>
              <View style={[s.toolIconWrap, { backgroundColor: 'rgba(212, 163, 115, 0.1)' }]}>
                <FileText size={16} color={Colors.accent} />
              </View>
              <View style={s.toolInfo}>
                <Text style={s.toolName}>Sales Reports</Text>
                <Text style={s.toolDesc}>Daily and period summaries</Text>
              </View>
              <ChevronRight size={14} color={IVORY} opacity={0.2} />
            </TouchableOpacity>
            <TouchableOpacity style={s.toolCard} activeOpacity={0.7}>
              <View style={[s.toolIconWrap, { backgroundColor: 'rgba(233, 196, 74, 0.1)' }]}>
                <Package size={16} color="#E9C46A" />
              </View>
              <View style={s.toolInfo}>
                <Text style={s.toolName}>Menu Sync</Text>
                <Text style={s.toolDesc}>Push menu items and pricing</Text>
              </View>
              <ChevronRight size={14} color={IVORY} opacity={0.2} />
            </TouchableOpacity>
            <TouchableOpacity style={s.toolCard} activeOpacity={0.7}>
              <View style={[s.toolIconWrap, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}>
                <Calendar size={16} color="#FF6B6B" />
              </View>
              <View style={s.toolInfo}>
                <Text style={s.toolName}>Transaction Log</Text>
                <Text style={s.toolDesc}>View daily transaction history</Text>
              </View>
              <ChevronRight size={14} color={IVORY} opacity={0.2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <View style={s.sectionDot} />
            <Zap size={12} color={Colors.accent} style={{ marginRight: 8 }} />
            <Text style={s.sectionLabel}>QUICK ACTIONS</Text>
          </View>
          <View style={s.quickActionsRow}>
            <TouchableOpacity style={s.quickAction} activeOpacity={0.7}>
              <RefreshCw size={16} color={Colors.accent} />
              <Text style={s.quickActionText}>Full Sync</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.quickAction} activeOpacity={0.7}>
              <FileText size={16} color={Colors.accent} />
              <Text style={s.quickActionText}>Export Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.quickAction} activeOpacity={0.7}>
              <Activity size={16} color={Colors.accent} />
              <Text style={s.quickActionText}>Diagnostics</Text>
            </TouchableOpacity>
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
  providerList: {
    gap: 10,
  },
  providerCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
  },
  providerCardSelected: {
    borderColor: 'rgba(212, 163, 115, 0.3)',
    backgroundColor: '#232E28',
  },
  providerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    color: IVORY,
    fontSize: 15,
    fontWeight: '600',
  },
  providerDesc: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
    marginTop: 2,
  },
  workflowCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workflowTitle: {
    color: IVORY,
    fontSize: 16,
    fontWeight: '700',
  },
  stepsList: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIndicator: {
    width: 20,
    alignItems: 'center',
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: IVORY,
    opacity: 0.15,
  },
  stepText: {
    color: IVORY,
    fontSize: 13,
    opacity: 0.3,
    fontWeight: '500',
  },
  stepTextActive: {
    opacity: 1,
    color: Colors.accent,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: IVORY,
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  toolsGrid: {
    gap: 10,
  },
  toolCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
  },
  toolIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    color: IVORY,
    fontSize: 14,
    fontWeight: '600',
  },
  toolDesc: {
    color: IVORY,
    fontSize: 10,
    opacity: 0.35,
    marginTop: 1,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickAction: {
    flex: 1,
    backgroundColor: DARK_OLIVE,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
  },
  quickActionText: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
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
