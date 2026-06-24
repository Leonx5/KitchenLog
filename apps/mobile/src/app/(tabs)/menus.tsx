import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Calendar, Users, ClipboardList, ChevronRight, Trash2, Menu as MenuIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { addMenu, deleteMenu, getMenus, getMenuTemplates, createMenuFromTemplate, Menu, MenuTemplate } from '@/utils/database';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { FadeInView } from '@/components/AnimatedWrappers';

const DARK_FOREST = '#0F1A15';
const IVORY = '#FDFCFB';
const DARK_OLIVE = '#1C2620';
const SOFT_SAND = 'rgba(212, 163, 115, 0.9)';

const MenuCard = ({ id, name, date, onDelete, status, type, portions }: any) => {
  const router = useRouter();
  return (
    <FadeInView style={styles.menuCard} duration={200}>
      <TouchableOpacity onPress={() => router.push(`/menus/${id}` as any)}>
        <View style={styles.menuCardHeader}>
          <View style={styles.menuCardIconWrap}>
            <ClipboardList size={16} color={Colors.accent} />
          </View>
          <View style={styles.menuCardInfo}>
            <Text style={styles.menuCardName}>{name}</Text>
            <Text style={styles.menuCardType}>{type ?? 'Event'}</Text>
          </View>
          <View style={styles.menuCardRight}>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: status === 'Completed' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(212, 163, 115, 0.1)',
                borderColor: status === 'Completed' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(212, 163, 115, 0.2)',
              }
            ]}>
              <Text style={[
                styles.statusText,
                { color: status === 'Completed' ? '#4ADE80' : Colors.accent }
              ]}>
                {(status ?? 'Draft').toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={(e) => { e.stopPropagation(); onDelete(id); }}
              style={styles.deleteBtn}
            >
              <Trash2 size={14} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuCardMeta}>
          <View style={styles.metaItem}>
            <Calendar size={12} color={IVORY} opacity={0.3} />
            <Text style={styles.metaItemText}>{date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={12} color={IVORY} opacity={0.3} />
            <Text style={styles.metaItemText}>{portions ?? 0} Portions</Text>
          </View>
        </View>

        <View style={styles.menuCardFooter}>
          <Text style={styles.groceryLink}>Generate Grocery List</Text>
          <ChevronRight size={14} color={Colors.accent} />
        </View>
      </TouchableOpacity>
    </FadeInView>
  );
};

export default function MenusScreen() {
  const insets = useSafeAreaInsets();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [templates, setTemplates] = useState<MenuTemplate[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [draft, setDraft] = useState({
    name: '',
    date: new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
  });

  const loadMenus = () => {
    const data = getMenus();
    setMenus(Array.isArray(data) ? data : []);
  };

  const loadTemplates = () => {
    const data = getMenuTemplates();
    setTemplates(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadMenus();
    loadTemplates();
  }, []);

  const handleSaveMenu = () => {
    if (draft.name.trim().length < 3) return;
    
    try {
      if (selectedTemplate) {
        createMenuFromTemplate(selectedTemplate, draft.name.trim(), draft.date.trim());
      } else {
        addMenu(draft.name.trim(), draft.date.trim());
      }
      
      setDraft({ 
        name: '', 
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }) 
      });
      setSelectedTemplate(null);
      setIsCreating(false);
      loadMenus();
    } catch (e) {
      console.error('FULL ERROR', JSON.stringify(e));
    }
  };

  const handleDeleteMenu = (id: number) => {
    deleteMenu(id);
    loadMenus();
  };

  const isValid = draft.name.trim().length >= 3;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Menus</Text>
            <Text style={styles.headerSub}>Menu planning & production</Text>
          </View>
          {!isCreating && (
            <TouchableOpacity style={styles.headerBtn} onPress={() => setIsCreating(true)}>
              <Plus size={20} color={Colors.accent} />
            </TouchableOpacity>
          )}
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
        {isCreating && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>NEW MENU</Text>
            <Text>FORM TEST</Text>
          </View>
        )}

        <FadeInView style={styles.productionCard} duration={200}>
          <ClipboardList size={22} color={Colors.accent} />
          <View style={styles.productionInfo}>
            <Text style={styles.productionTitle}>Upcoming Production</Text>
            <Text style={styles.productionDesc}>
              {menus.length} menu{menus.length !== 1 ? 's' : ''} this week
            </Text>
          </View>
        </FadeInView>

        {menus.length === 0 && !isCreating && (
          <View style={styles.emptyState}>
            <MenuIcon size={32} color={IVORY} opacity={0.15} />
            <Text style={styles.emptyText}>No menus yet</Text>
            <Text style={styles.emptyHint}>Tap the + button to create one</Text>
          </View>
        )}

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
    backgroundColor: DARK_FOREST,
    flex: 1,
  },
  header: {
    backgroundColor: DARK_FOREST,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 163, 115, 0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    color: IVORY,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSub: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
    marginTop: 1,
    letterSpacing: 0.3,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: DARK_OLIVE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.12)',
    marginBottom: 20,
  },
  formTitle: {
    color: SOFT_SAND,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 16,
    opacity: 0.7,
  },
  input: {
    backgroundColor: 'rgba(15, 26, 21, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
    padding: 12,
    marginBottom: 10,
    color: IVORY,
    fontSize: 14,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.15)',
  },
  cancelBtnText: {
    color: IVORY,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: DARK_FOREST,
    fontSize: 12,
    fontWeight: '700',
  },
  productionCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  productionInfo: {
    flex: 1,
  },
  productionTitle: {
    color: IVORY,
    fontSize: 15,
    fontWeight: '600',
  },
  productionDesc: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  menuCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
    marginBottom: 12,
  },
  menuCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuCardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuCardInfo: {
    flex: 1,
  },
  menuCardName: {
    color: IVORY,
    fontSize: 16,
    fontWeight: '600',
  },
  menuCardType: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
    marginTop: 1,
  },
  menuCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deleteBtn: {
    padding: 6,
  },
  menuCardMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItemText: {
    color: IVORY,
    fontSize: 12,
    opacity: 0.4,
  },
  menuCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 163, 115, 0.05)',
    paddingTop: 12,
  },
  groceryLink: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    color: IVORY,
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.3,
  },
  emptyHint: {
    color: IVORY,
    fontSize: 12,
    opacity: 0.2,
  },
});
