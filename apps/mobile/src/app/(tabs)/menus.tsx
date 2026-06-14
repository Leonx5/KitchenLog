import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Calendar, Users, ClipboardList, ChevronRight, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { addMenu, deleteMenu, getMenus, Menu } from '@/utils/database';

const MenuCard = ({ id, name, type, date, portions, status, onDelete }: any) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push(`/menus/${id}` as any)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D4A373',
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
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>{name}</Text>
          <Text style={{ fontSize: 13, color: '#6B7280' }}>{type ?? 'Event'}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              backgroundColor: status === 'Active' ? '#F8F5F0' : '#F3F4F6',
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderWidth: status === 'Active' ? 1 : 0,
              borderColor: '#2D6A4F',
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: status === 'Active' ? '#2D6A4F' : '#6B7280',
              }}
            >
              {status ?? 'Draft'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            style={{ padding: 4 }}
          >
            <Trash2 size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Calendar size={14} color="#6B7280" />
          <Text style={{ fontSize: 12, color: '#6B7280' }}>{date}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Users size={14} color="#6B7280" />
          <Text style={{ fontSize: 12, color: '#6B7280' }}>{portions ?? 0} Portions</Text>
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
        <Text style={{ fontSize: 13, fontWeight: '500', color: '#1B4332' }}>
          Generate Grocery List
        </Text>
        <ChevronRight size={16} color="#1B4332" />
      </View>
    </TouchableOpacity>
  );
};

export default function MenusScreen() {
  const insets = useSafeAreaInsets();
  const [menus, setMenus] = useState<Menu[]>([]);

  const loadMenus = () => {
    const data = getMenus();
    setMenus(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleAddMenu = () => {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    addMenu('New Event', today);
    loadMenus();
  };

  const handleDeleteMenu = (id: number) => {
    deleteMenu(id);
    loadMenus();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Menus</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleAddMenu}>
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
            backgroundColor: '#F8F5F0',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#D4A373',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <ClipboardList size={24} color="#1B4332" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
              Upcoming Production
            </Text>
            <Text style={{ fontSize: 12, color: '#1B4332', opacity: 0.8 }}>
              {menus.length} menus require attention this week
            </Text>
          </View>
        </View>

        {menus.map((menu) => (
          <MenuCard 
            key={menu.id} 
            id={menu.id}
            name={menu.name}
            date={menu.event_date}
            onDelete={handleDeleteMenu}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F5F0',
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#D4A373',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    backgroundColor: '#1B4332',
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
    color: '#1F2937',
    fontSize: 24,
    fontWeight: '600',
  },
});
