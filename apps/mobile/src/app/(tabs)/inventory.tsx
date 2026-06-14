import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Package, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react-native';
import {
  addInventoryItem,
  getIngredients,
  getInventory,
  updateInventoryQuantity,
} from '@/utils/database';

type InventoryRow = {
  id: number;
  ingredient_id: number | null;
  quantity: number;
  minimum_quantity: number;
  ingredient_name: string | null;
  category: string | null;
  unit: string | null;
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
    <View
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
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
            {item.ingredient_name ?? 'Ingredient'}
          </Text>
          <Text style={{ fontSize: 13, color: '#6B7280' }}>
            Category: {item.category ?? 'Raw Ingredients'}
          </Text>
        </View>
        {isLow && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#F8F5F0',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: '#D4A373',
            }}
          >
            <AlertTriangle size={12} color="#D4A373" />
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#D4A373' }}>LOW STOCK</Text>
          </View>
        )}
      </View>

      <View style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 12, color: '#6B7280' }}>Stock Level</Text>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#1F2937' }}>
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
              backgroundColor: isLow ? '#D4A373' : '#16A34A',
              borderRadius: 3,
            }}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
        <TouchableOpacity
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
            borderColor: '#D4A373',
          }}
        >
          <ArrowDown size={14} color="#6B7280" />
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151' }}>Remove</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onAddStock(item)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: '#1B4332',
          }}
        >
          <ArrowUp size={14} color="#FFFFFF" />
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#FFFFFF' }}>Add Stock</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const [inventory, setInventory] = useState<InventoryRow[]>([]);

  const loadInventory = () => {
    const data = getInventory();
    setInventory(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAddInventoryItem = () => {
    const ingredients = getIngredients();
    const firstIngredient = Array.isArray(ingredients) ? ingredients[0] : null;

    if (!firstIngredient) {
      return;
    }

    addInventoryItem(firstIngredient.id, 10, 5);
    loadInventory();
  };

  const handleAddStock = (item: InventoryRow) => {
    updateInventoryQuantity(item.id, item.quantity + 1);
    loadInventory();
  };

  const handleRemoveStock = (item: InventoryRow) => {
    updateInventoryQuantity(item.id, Math.max(item.quantity - 1, 0));
    loadInventory();
  };

  const lowStockCount = inventory.filter(
    (item) => item.quantity < item.minimum_quantity
  ).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F5F0', paddingTop: insets.top }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#D4A373',
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 24, fontWeight: '600', color: '#1F2937' }}>Inventory</Text>
          <TouchableOpacity
            onPress={handleAddInventoryItem}
            style={{ backgroundColor: '#1B4332', borderRadius: 8, padding: 8 }}
          >
            <Package size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={handleAddInventoryItem}
          style={{
            backgroundColor: '#1B4332',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600', textAlign: 'center' }}>
            Add Inventory Item
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#D4A373',
              marginRight: 8,
            }}
          >
            <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>TOTAL ITEMS</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
              {inventory.length}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#D4A373',
            }}
          >
            <Text style={{ fontSize: 11, color: '#D4A373', marginBottom: 4 }}>LOW STOCK</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#D4A373' }}>
              {lowStockCount}
            </Text>
          </View>
        </View>

        {inventory.map((item) => (
          <InventoryItem
            key={item.id}
            item={item}
            onAddStock={handleAddStock}
            onRemoveStock={handleRemoveStock}
          />
        ))}
      </ScrollView>
    </View>
  );
}
