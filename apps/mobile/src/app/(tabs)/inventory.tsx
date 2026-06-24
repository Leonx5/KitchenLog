import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Package, AlertTriangle, ArrowDown, ArrowUp, Clock, ChevronRight, Plus } from 'lucide-react-native';
import {
  addInventoryItem,
  getIngredients,
  getInventory,
  getInventoryHistory,
  updateInventoryQuantity,
  Ingredient
} from '@/utils/database';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { FadeInView } from '@/components/AnimatedWrappers';

const DARK_FOREST = '#0F1A15';
const IVORY = '#FDFCFB';
const DARK_OLIVE = '#1C2620';
const SOFT_SAND = 'rgba(212, 163, 115, 0.9)';

type InventoryRow = {
  id: number;
  ingredient_id: number | null;
  quantity: number;
  minimum_quantity: number;
  ingredient_name: string | null;
  category: string | null;
  unit: string | null;
};

type HistoryRow = {
  id: number;
  ingredient_name: string;
  menu_name: string | null;
  quantity: number;
  transaction_type: string;
  created_at: string;
  unit: string | null;
};

const HistoryEntry = ({ item }: { item: HistoryRow }) => {
  const isAddition = item.quantity > 0;
  const date = new Date(item.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.historyCard}>
      <View style={styles.historyRow}>
        <View style={styles.historyInfo}>
          <Text style={styles.historyIngredient}>{item.ingredient_name}</Text>
          <Text style={styles.historyDetail}>
            {item.transaction_type} {item.menu_name ? `• ${item.menu_name}` : ''}
          </Text>
        </View>
        <View style={styles.historyValues}>
          <Text style={[styles.historyQty, { color: isAddition ? '#4ADE80' : '#FF6B6B' }]}>
            {isAddition ? '+' : ''}{item.quantity.toFixed(1)} {item.unit}
          </Text>
          <Text style={styles.historyDate}>{date}</Text>
        </View>
      </View>
    </View>
  );
};

const InventoryItem = ({
  item,
  onAddStock,
  onRemoveStock,
}: {
  item: InventoryRow;
  onAddStock: (item: InventoryRow) => void;
  onRemoveStock: (item: InventoryRow) => void;
}) => {
  const current = item.quantity;
  const required = item.minimum_quantity;
  const unit = item.unit ?? '';
  const isLow = current < required;
  const percentage = required > 0 ? Math.min((current / required) * 100, 100) : 100;

  return (
    <FadeInView style={styles.invCard} duration={200}>
      <View style={styles.invHeader}>
        <View style={styles.invInfo}>
          <View style={styles.invNameRow}>
            <Package size={14} color={Colors.accent} style={{ marginRight: 8 }} />
            <Text style={styles.invName}>{item.ingredient_name ?? 'Ingredient'}</Text>
          </View>
          <Text style={styles.invCategory}>{item.category ?? 'Raw Ingredients'}</Text>
        </View>
        {isLow && (
          <View style={styles.lowStockBadge}>
            <AlertTriangle size={10} color={Colors.accent} />
            <Text style={styles.lowStockText}>LOW</Text>
          </View>
        )}
      </View>

      <View style={styles.stockBarSection}>
        <View style={styles.stockLabels}>
          <Text style={styles.stockLabel}>Stock Level</Text>
          <Text style={styles.stockValues}>{current} / {required} {unit}</Text>
        </View>
        <View style={styles.stockBarBg}>
          <View style={[styles.stockBarFill, { width: `${percentage}%`, backgroundColor: isLow ? Colors.accent : '#4ADE80' }]} />
        </View>
      </View>

      <View style={styles.invActions}>
        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemoveStock(item)}>
          <ArrowDown size={12} color={IVORY} opacity={0.5} />
          <Text style={styles.removeBtnText}>Remove</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addStockBtn} onPress={() => onAddStock(item)}>
          <ArrowUp size={12} color={DARK_FOREST} />
          <Text style={styles.addStockBtnText}>Add Stock</Text>
        </TouchableOpacity>
      </View>
    </FadeInView>
  );
};

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [activeTab, setActiveTab] = useState('stock');
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState({
    ingredientId: null as number | null,
    quantity: '',
    minQuantity: '',
  });

  const loadData = () => {
    const invData = getInventory();
    const histData = getInventoryHistory();
    const allIngredients = getIngredients();
    
    setInventory(Array.isArray(invData) ? invData : []);
    setHistory(Array.isArray(histData) ? histData : []);
    
    const inStockIds = (invData as any[]).map(i => i.ingredient_id);
    setAvailableIngredients(allIngredients.filter(i => !inStockIds.includes(i.id)));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveInventoryItem = () => {
    if (!draft.ingredientId) return;
    try {
      addInventoryItem(
        draft.ingredientId, 
        parseFloat(draft.quantity) || 0, 
        parseFloat(draft.minQuantity) || 0
      );
      setDraft({ ingredientId: null, quantity: '', minQuantity: '' });
      setIsCreating(false);
      loadData();
    } catch (e) {
      console.error('FULL ERROR', JSON.stringify(e));
    }
  };

  const handleAddStock = (item: InventoryRow) => {
    updateInventoryQuantity(item.id, item.quantity + 1);
    loadData();
  };

  const handleRemoveStock = (item: InventoryRow) => {
    updateInventoryQuantity(item.id, Math.max(item.quantity - 1, 0));
    loadData();
  };

  const lowStockCount = inventory.filter(
    (item) => item.quantity < item.minimum_quantity
  ).length;

  const isValid = draft.ingredientId !== null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Inventory</Text>
            <Text style={styles.headerSub}>Stock tracking & audit</Text>
          </View>
          {!isCreating && activeTab === 'stock' && (
            <TouchableOpacity style={styles.headerBtn} onPress={() => setIsCreating(true)}>
              <Package size={18} color={Colors.accent} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabsRow}>
          {['stock', 'history'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => { setActiveTab(tab); setIsCreating(false); }}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'stock' ? 'Current Stock' : 'Audit Log'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'stock' ? (
          <>
            {isCreating ? (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>TRACK NEW INGREDIENT</Text>
                {availableIngredients.map((ing) => (
                  <TouchableOpacity
                    key={ing.id}
                    style={[styles.ingChip, draft.ingredientId === ing.id && styles.ingChipSelected]}
                    onPress={() => setDraft({ ...draft, ingredientId: ing.id })}
                  >
                    <Text style={[styles.ingChipText, draft.ingredientId === ing.id && styles.ingChipTextSelected]}>
                      {ing.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TextInput
                  style={styles.input}
                  placeholder="Quantity"
                  placeholderTextColor="rgba(253,252,251,0.25)"
                  keyboardType="numeric"
                  value={draft.quantity}
                  onChangeText={(t) => setDraft({ ...draft, quantity: t })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Minimum quantity"
                  placeholderTextColor="rgba(253,252,251,0.25)"
                  keyboardType="numeric"
                  value={draft.minQuantity}
                  onChangeText={(t) => setDraft({ ...draft, minQuantity: t })}
                />
                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsCreating(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveBtn, !isValid && { opacity: 0.4 }]}
                    onPress={handleSaveInventoryItem}
                    disabled={!isValid}
                  >
                    <Text style={styles.saveBtnText}>Track Item</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={() => setIsCreating(true)}>
                <Plus size={16} color={DARK_FOREST} />
                <Text style={styles.addButtonText}>Track Ingredient in Inventory</Text>
              </TouchableOpacity>
            )}

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>TOTAL ITEMS</Text>
                <Text style={styles.summaryValue}>{inventory.length}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryLabel, { color: Colors.accent }]}>LOW STOCK</Text>
                <Text style={[styles.summaryValue, { color: Colors.accent }]}>{lowStockCount}</Text>
              </View>
            </View>

            {inventory.length === 0 && !isCreating && (
              <View style={styles.emptyState}>
                <Package size={32} color={IVORY} opacity={0.15} />
                <Text style={styles.emptyText}>No inventory items</Text>
                <Text style={styles.emptyHint}>Track ingredients to get started</Text>
              </View>
            )}

            {inventory.map((item) => (
              <InventoryItem
                key={item.id}
                item={item}
                onAddStock={handleAddStock}
                onRemoveStock={handleRemoveStock}
              />
            ))}
          </>
        ) : (
          <View>
            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <Clock size={32} color={IVORY} opacity={0.15} />
                <Text style={styles.emptyText}>No transaction history</Text>
              </View>
            ) : (
              history.map((entry) => (
                <HistoryEntry key={entry.id} item={entry} />
              ))
            )}
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: DARK_FOREST,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 163, 115, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  tabsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  tab: {
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.accent,
  },
  tabText: {
    color: IVORY,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.35,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tabTextActive: {
    opacity: 1,
    color: Colors.accent,
  },
  addButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: DARK_FOREST,
    fontSize: 13,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.12)',
    marginBottom: 16,
  },
  formTitle: {
    color: SOFT_SAND,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 16,
    opacity: 0.7,
  },
  ingChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
    backgroundColor: 'rgba(15, 26, 21, 0.5)',
    marginBottom: 8,
  },
  ingChipSelected: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
  },
  ingChipText: {
    color: IVORY,
    fontSize: 13,
    opacity: 0.7,
  },
  ingChipTextSelected: {
    opacity: 1,
    color: Colors.accent,
    fontWeight: '600',
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
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: DARK_OLIVE,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
  },
  summaryLabel: {
    color: IVORY,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    opacity: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    color: IVORY,
    fontSize: 20,
    fontWeight: '700',
  },
  invCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
    marginBottom: 12,
  },
  invHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invInfo: {
    flex: 1,
  },
  invNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invName: {
    color: IVORY,
    fontSize: 16,
    fontWeight: '600',
  },
  invCategory: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
    marginTop: 1,
    marginLeft: 22,
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.2)',
  },
  lowStockText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  stockBarSection: {
    marginBottom: 12,
  },
  stockLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stockLabel: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.4,
  },
  stockValues: {
    color: IVORY,
    fontSize: 11,
    fontWeight: '600',
  },
  stockBarBg: {
    height: 6,
    backgroundColor: 'rgba(15, 26, 21, 0.5)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  stockBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  invActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 163, 115, 0.05)',
    paddingTop: 12,
  },
  removeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.15)',
  },
  removeBtnText: {
    color: IVORY,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
  },
  addStockBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.accent,
  },
  addStockBtnText: {
    color: DARK_FOREST,
    fontSize: 12,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: DARK_OLIVE,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
  },
  historyIngredient: {
    color: IVORY,
    fontSize: 14,
    fontWeight: '600',
  },
  historyDetail: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
    marginTop: 2,
  },
  historyValues: {
    alignItems: 'flex-end',
  },
  historyQty: {
    fontSize: 14,
    fontWeight: '700',
  },
  historyDate: {
    color: IVORY,
    fontSize: 10,
    opacity: 0.3,
    marginTop: 2,
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
