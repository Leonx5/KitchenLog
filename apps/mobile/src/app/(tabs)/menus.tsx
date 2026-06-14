import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Calendar, Users, ClipboardList, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const MenuCard = ({ id, name, type, date, portions, status }: any) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push(`/menus/${id}` as any)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
        marginBottom: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <View>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>{name}</Text>
          <Text style={{ fontSize: 13, color: '#6B7280' }}>{type}</Text>
        </View>
        <View
          style={{
            backgroundColor: status === 'Active' ? '#EFF6FF' : '#F3F4F6',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: status === 'Active' ? '#2563EB' : '#6B7280',
            }}
          >
            {status}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Calendar size={14} color="#6B7280" />
          <Text style={{ fontSize: 12, color: '#6B7280' }}>{date}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Users size={14} color="#6B7280" />
          <Text style={{ fontSize: 12, color: '#6B7280' }}>{portions} Portions</Text>
        </View>
      </View>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          marginTop: 12,
          paddingTop: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '500', color: '#2563EB' }}>
          Generate Grocery List
        </Text>
        <ChevronRight size={16} color="#2563EB" />
      </View>
    </TouchableOpacity>
  );
};

export default function MenusScreen() {
  const insets = useSafeAreaInsets();

  const mockMenus = [
    {
      id: 1,
      name: 'Corporate Gala',
      type: 'Dinner Event',
      date: 'June 12, 2026',
      portions: 250,
      status: 'Active',
    },
    {
      id: 2,
      name: 'Hospital Lunch',
      type: 'Daily Meal Service',
      date: 'Daily',
      portions: 1200,
      status: 'Draft',
    },
    {
      id: 3,
      name: 'Wedding Reception',
      type: 'Wedding',
      date: 'July 05, 2026',
      portions: 150,
      status: 'Draft',
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Menus</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: '#EFF6FF',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#BFDBFE',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <ClipboardList size={24} color="#2563EB" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E40AF' }}>
              Upcoming Production
            </Text>
            <Text style={{ fontSize: 12, color: '#1E40AF', opacity: 0.8 }}>
              3 menus require attention this week
            </Text>
          </View>
        </View>

        {mockMenus.map((menu, index) => (
          <MenuCard key={index} {...menu} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 8,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '600',
  },
});
