import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Leaf, ChefHat, Sparkles } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';

const DARK_FOREST = '#0F1A15';
const IVORY = '#FDFCFB';
const SOFT_SAND = 'rgba(212, 163, 115, 0.9)';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.accent} />
        </TouchableOpacity>
        <Text style={styles.title}>About PrepFlow</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Leaf size={48} color={Colors.accent} />
          <Text style={styles.appName}>PrepFlow</Text>
          <View style={styles.divider} />
          <Text style={styles.description}>
            PrepFlow automates the business side of cooking by helping chefs manage ingredients,
            inventory, menus, costing, purchasing, and reporting.
          </Text>
        </View>

        <View style={styles.creditCard}>
          <ChefHat size={20} color={Colors.accent} />
          <View style={styles.creditInfo}>
            <Text style={styles.creditLabel}>Created by</Text>
            <Text style={styles.creditValue}>@chefleonokendo</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Sparkles size={16} color={Colors.accent} />
          <Text style={styles.featureText}>MVP Version 1.0</Text>
        </View>
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
    backgroundColor: '#1C2620',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
  },
  appName: {
    color: IVORY,
    fontSize: 28,
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
    opacity: 0.8,
  },
  creditCard: {
    backgroundColor: '#1C2620',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
  },
  creditInfo: {
    flex: 1,
  },
  creditLabel: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  creditValue: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  featureCard: {
    backgroundColor: '#1C2620',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
  },
  featureText: {
    color: IVORY,
    fontSize: 13,
    opacity: 0.7,
  },
});
