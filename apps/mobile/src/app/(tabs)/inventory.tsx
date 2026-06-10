import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Package, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react-native';

const InventoryItem = ({ name, current, required, unit }: any) => {
  const isLow = current < required;
  const percentage = Math.min((current / required) * 100, 100);

  return (
    <View
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
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>{name}</Text>
          <Text style={{ fontSize: 13, color: '#6B7280' }}>Category: Raw Ingredients</Text>
        </View>
        {isLow && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#FEF2F2',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
            }}
          >
            <AlertTriangle size={12} color="#EF4444" />
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#EF4444' }}>LOW STOCK</Text>
          </View>
        )}
      </View>

      <View style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 12, color: '#6B7280' }}>Stock Level</Text>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827' }}>
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
              backgroundColor: isLow ? '#EF4444' : '#16A34A',
              borderRadius: 3,
            }}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}
        >
          <ArrowDown size={14} color="#6B7280" />
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151' }}>Remove</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: '#2563EB',
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

  const mockInventory = [
    { name: 'Chicken Breast', current: 2.5, required: 15, unit: 'kg' },
    { name: 'Basmati Rice', current: 45, required: 50, unit: 'kg' },
    { name: 'Heavy Cream', current: 1.2, required: 5, unit: 'litres' },
    { name: 'Olive Oil', current: 8, required: 5, unit: 'litres' },
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
          <Text style={{ fontSize: 24, fontWeight: '600', color: '#111827' }}>Inventory</Text>
          <TouchableOpacity style={{ backgroundColor: '#2563EB', borderRadius: 8, padding: 8 }}>
            <Package size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              marginRight: 8,
            }}
          >
            <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>TOTAL ITEMS</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>42</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <Text style={{ fontSize: 11, color: '#EF4444', marginBottom: 4 }}>LOW STOCK</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#EF4444' }}>8</Text>
          </View>
        </View>

        {mockInventory.map((item, index) => (
          <InventoryItem key={index} {...item} />
        ))}
      </ScrollView>
    </View>
  );
}
