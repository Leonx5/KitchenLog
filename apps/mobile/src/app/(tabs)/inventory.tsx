import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Package, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react-native';
import {
  addInventoryItem,
  getIngredients,
  getInventory,
  getInventoryHistory,
  updateInventoryQuantity,
} from '@/utils/database';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { AnimatedButton, FadeInView } from '@/components/AnimatedWrappers';
import { Clock } from 'lucide-react-native';

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
    <View
      style={{
        backgroundColor: Colors.surface,
        padding: 14,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.label, { fontSize: 14, color: Colors.text }]}>
            {item.ingredient_name}
          </Text>
          <Text style={[Typography.bodyText, { fontSize: 11, color: '#9CA3AF', marginTop: 2 }]}>
            {item.transaction_type} {item.menu_name ? `• ${item.menu_name}` : ''}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text 
            style={[
              Typography.label, 
              { 
                fontSize: 14, 
                color: isAddition ? Colors.success : Colors.destructive,
                fontWeight: '700'
              }
            ]}
          >
            {isAddition ? '+' : ''}{item.quantity.toFixed(1)} {item.unit}
          </Text>
          <Text style={[Typography.bodyText, { fontSize: 10, color: '#9CA3AF', marginTop: 2 }]}>
            {date}
          </Text>
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
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={[{ fontSize: 16, color: Colors.text }, Typography.cardTitle]}>
            {item.ingredient_name ?? 'Ingredient'}
          </Text>
          <Text style={[{ fontSize: 13, color: '#6B7280' }, Typography.bodyText]}>
            Category: {item.category ?? 'Raw Ingredients'}
          </Text>
        </View>
        {isLow && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: Colors.background,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <AlertTriangle size={12} color={Colors.accent} />
            <Text style={[{ fontSize: 11, color: Colors.accent }, Typography.label]}>LOW STOCK</Text>
          </View>
        )}
      </View>

      <View style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={[{ fontSize: 12, color: '#6B7280' }, Typography.bodyText]}>Stock Level</Text>
          <Text style={[{ fontSize: 12, color: Colors.text }, Typography.label]}>
            {current} / {required} {unit}
          </Text>
        </View>
        <View
          style={{ height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}
        >
          <View
            style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: isLow ? Colors.accent : Colors.success,
              borderRadius: 3,
            }}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
        <AnimatedButton
          onPress={() => onRemoveStock(item)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <ArrowDown size={14} color="#6B7280" />
          <Text style={[{ fontSize: 13, color: '#374151' }, Typography.label]}>Remove</Text>
        </AnimatedButton>
        <AnimatedButton
          onPress={() => onAddStock(item)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: Colors.primary,
          }}
        >
          <ArrowUp size={14} color={Colors.surface} />
          <Text style={[{ fontSize: 13, color: Colors.surface }, Typography.label]}>Add Stock</Text>
        </AnimatedButton>
      </View>
    </FadeInView>
  );
};

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [activeTab, setActiveTab] = useState('stock'); // stock or history

  const loadData = () => {
    const invData = getInventory();
    const histData = getInventoryHistory();
    setInventory(Array.isArray(invData) ? invData : []);
    setHistory(Array.isArray(histData) ? histData : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddInventoryItem = () => {
    const ingredients = getIngredients();
    const firstIngredient = Array.isArray(ingredients) ? ingredients[0] : null;

    if (!firstIngredient) {
      return;
    }

    addInventoryItem(firstIngredient.id, 10, 5);
    loadData();
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

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: insets.top }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: Colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
        >
          <Text style={[Typography.screenTitle, { color: Colors.text }]}>Inventory</Text>
          <AnimatedButton
            onPress={handleAddInventoryItem}
            style={{ backgroundColor: Colors.primary, borderRadius: 8, padding: 8 }}
          >
            <Package size={20} color={Colors.surface} />
          </AnimatedButton>
        </View>

        <View style={{ flexDirection: 'row', gap: 20 }}>
          {['stock', 'history'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingBottom: 8,
                borderBottomWidth: 2,
                borderBottomColor: activeTab === tab ? Colors.primary : 'transparent',
              }}
            >
              <Text
                style={[
                  Typography.label,
                  {
                    fontSize: 13,
                    color: activeTab === tab ? Colors.text : '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }
                ]}
              >
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
            <AnimatedButton
              onPress={handleAddInventoryItem}
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Text style={[{ color: Colors.surface, textAlign: 'center' }, Typography.buttonText]}>
                Add Inventory Item
              </Text>
            </AnimatedButton>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <FadeInView
                style={{
                  flex: 1,
                  backgroundColor: Colors.surface,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  marginRight: 8,
                }}
              >
                <Text style={[{ fontSize: 11, color: '#6B7280', marginBottom: 4 }, Typography.label]}>TOTAL ITEMS</Text>
                <Text style={[{ fontSize: 18, color: Colors.text }, Typography.body]}>
                  {inventory.length}
                </Text>
              </FadeInView>
              <FadeInView
                style={{
                  flex: 1,
                  backgroundColor: Colors.surface,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
              >
                <Text style={[{ fontSize: 11, color: Colors.accent, marginBottom: 4 }, Typography.label]}>LOW STOCK</Text>
                <Text style={[{ fontSize: 18, color: Colors.accent }, Typography.body]}>
                  {lowStockCount}
                </Text>
              </FadeInView>
            </View>

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
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Clock size={32} color="#D1D5DB" />
                <Text style={[Typography.bodyText, { color: '#9CA3AF', marginTop: 12 }]}>
                  No transaction history found.
                </Text>
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
