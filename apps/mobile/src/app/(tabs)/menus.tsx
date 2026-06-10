import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
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
    <View style={{ flex: 1, backgroundColor: '#F9FAFB', paddingTop: insets.top }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 24, fontWeight: '600', color: '#111827' }}>Menus</Text>
          <TouchableOpacity style={{ backgroundColor: '#2563EB', borderRadius: 8, padding: 8 }}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
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
