import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Calendar, Users, ClipboardList, ChevronRight, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { addMenu, deleteMenu, getMenus, Menu } from '@/utils/database';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { AnimatedButton, FadeInView } from '@/components/AnimatedWrappers';

const MenuCard = ({ id, name, type, date, portions, status, onDelete }: any) => {
  const router = useRouter();
  return (
    <FadeInView
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 16,
        marginBottom: 12,
      }}
      duration={200}
    >
      <TouchableOpacity
        onPress={() => router.push(`/menus/${id}` as any)}
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
            <Text style={[Typography.cardTitle, { color: Colors.text }]}>{name}</Text>
            <Text style={[Typography.bodyText, { color: '#6B7280' }]}>{type ?? 'Event'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                backgroundColor: 
                  status === 'Completed' ? 'rgba(22, 163, 74, 0.1)' : 
                  status === 'Active' ? 'rgba(45, 106, 79, 0.1)' : 
                  '#F3F4F6',
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: status === 'Active' || status === 'Completed' ? 1 : 0,
                borderColor: 
                  status === 'Completed' ? Colors.success : 
                  status === 'Active' ? Colors.secondary : 
                  '#6B7280',
              }}
            >
              <Text
                style={[
                  Typography.label,
                  {
                    fontSize: 11,
                    color: 
                      status === 'Completed' ? Colors.success : 
                      status === 'Active' ? Colors.secondary : 
                      '#6B7280',
                  }
                ]}
              >
                {(status ?? 'Draft').toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              style={{ padding: 4 }}
            >
              <Trash2 size={18} color={Colors.destructive} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color="#6B7280" />
            <Text style={[Typography.bodyText, { fontSize: 12, color: '#6B7280' }]}>{date}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Users size={14} color="#6B7280" />
            <Text style={[Typography.bodyText, { fontSize: 12, color: '#6B7280' }]}>{portions ?? 0} Portions</Text>
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
          <Text style={[Typography.label, { fontSize: 13, color: Colors.primary }]}>
            Generate Grocery List
          </Text>
          <ChevronRight size={16} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    </FadeInView>
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
          <AnimatedButton style={styles.headerButton} onPress={handleAddMenu}>
            <Plus size={20} color={Colors.surface} />
          </AnimatedButton>
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
        <FadeInView
          style={{
            backgroundColor: Colors.background,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: Colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <ClipboardList size={24} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[Typography.label, { fontSize: 14, color: Colors.text }]}>
              Upcoming Production
            </Text>
            <Text style={[Typography.bodyText, { fontSize: 12, color: Colors.primary, opacity: 0.8 }]}>
              {menus.length} menus require attention this week
            </Text>
          </View>
        </FadeInView>

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
    backgroundColor: Colors.background,
    flex: 1,
  },
  header: {
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    backgroundColor: Colors.primary,
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
    ...Typography.screenTitle,
    color: Colors.text,
  },
});
