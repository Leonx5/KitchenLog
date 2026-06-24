import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Palette, Bell, Database, FileText, Info, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';

const DARK_FOREST = '#0F1A15';
const IVORY = '#FDFCFB';

type SettingItem = {
  icon: any;
  label: string;
  description: string;
};

const SETTINGS: SettingItem[] = [
  { icon: Palette, label: 'Theme', description: 'Customize appearance' },
  { icon: Bell, label: 'Notifications', description: 'Configure alerts' },
  { icon: Database, label: 'Backup Data', description: 'Export or restore data' },
  { icon: FileText, label: 'Export Reports', description: 'Generate reports' },
  { icon: Info, label: 'About KitchenLog', description: 'Learn more about the app' },
];

function SettingRow({ icon: Icon, label, description, onPress }: SettingItem & { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Icon size={18} color={Colors.accent} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <ChevronRight size={16} color="rgba(253, 252, 251, 0.3)" />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.accent} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APPLICATION</Text>
          <View style={styles.settingsCard}>
            {SETTINGS.slice(0, 4).map((item, index) => (
              <React.Fragment key={item.label}>
                <SettingRow {...item} onPress={() => {}} />
                {index < 3 && <View style={styles.separator} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>INFORMATION</Text>
          <View style={styles.settingsCard}>
            <SettingRow {...SETTINGS[4]} onPress={() => router.push('/about')} />
          </View>
        </View>

        <Text style={styles.footerText}>KitchenLog MVP v1.0</Text>
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
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    color: IVORY,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    opacity: 0.4,
    paddingHorizontal: 4,
  },
  settingsCard: {
    backgroundColor: '#1C2620',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: IVORY,
    fontSize: 14,
    fontWeight: '600',
  },
  settingDesc: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.4,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(212, 163, 115, 0.08)',
    marginLeft: 64,
  },
  footerText: {
    color: IVORY,
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.25,
    marginTop: 8,
  },
});
