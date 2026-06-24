import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChefHat, Layers, Package, FileText, BarChart3 } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';

const DARK_FOREST = '#0F1A15';
const IVORY = '#FDFCFB';
const SOFT_SAND = 'rgba(212, 163, 115, 0.9)';
const DARK_OLIVE = '#1C2620';

const CAPABILITIES = [
  { icon: Layers, label: 'Recipe & Menu Management' },
  { icon: Package, label: 'Real-time Inventory Tracking' },
  { icon: FileText, label: 'Costing & Profit Analysis' },
  { icon: BarChart3, label: 'Kitchen Operations Dashboard' },
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={Colors.accent} />
          </TouchableOpacity>
          <Text style={styles.title}>About</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heroCard}>
            <ChefHat size={40} color={Colors.accent} />
            <Text style={styles.appName}>KitchenLog</Text>
            <View style={styles.divider} />
            <Text style={styles.description}>
              KitchenLog is the chef's operations dashboard — unifying inventory, recipes, menus, and costing into a single platform built for the kitchen.
            </Text>
          </View>

          <View style={styles.creditCard}>
            <View style={styles.creditAvatar}>
              <ChefHat size={22} color={DARK_FOREST} />
            </View>
            <View style={styles.creditInfo}>
              <Text style={styles.creditLabel}>Created by</Text>
              <Text style={styles.creditValue}>Chef Leon Okendo</Text>
              <Text style={styles.creditTag}>Culinary Technologist</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>CAPABILITIES</Text>
            <View style={styles.capabilitiesGrid}>
              {CAPABILITIES.map((cap, i) => (
                <View key={i} style={styles.capRow}>
                  <View style={styles.capIconWrap}>
                    <cap.icon size={14} color={Colors.accent} />
                  </View>
                  <Text style={styles.capText}>{cap.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.versionRow}>
            <View style={styles.versionDot} />
            <Text style={styles.versionText}>Version 1.0 MVP</Text>
          </View>
        </ScrollView>
      </View>
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
    marginRight: 12,
  },
  title: {
    color: IVORY,
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  heroCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
  },
  appName: {
    color: IVORY,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 16,
    letterSpacing: 1,
  },
  divider: {
    width: 32,
    height: 2,
    backgroundColor: Colors.accent,
    marginVertical: 16,
    opacity: 0.6,
  },
  description: {
    color: IVORY,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.75,
  },
  creditCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
  },
  creditAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditInfo: {
    flex: 1,
  },
  creditLabel: {
    color: IVORY,
    fontSize: 10,
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  creditValue: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  creditTag: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
    marginTop: 1,
  },
  sectionCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
  },
  sectionLabel: {
    color: SOFT_SAND,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 14,
    opacity: 0.7,
  },
  capabilitiesGrid: {
    gap: 12,
  },
  capRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  capIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 163, 115, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capText: {
    color: IVORY,
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  versionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
    opacity: 0.5,
  },
  versionText: {
    color: IVORY,
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.3,
    letterSpacing: 0.5,
  },
});
