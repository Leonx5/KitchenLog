import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Scale, DollarSign, ListTodo, Info } from 'lucide-react-native';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [requiredYield, setRequiredYield] = useState('10');
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<any>(null);

  // Mock data for initial build
  useEffect(() => {
    setTimeout(() => {
      setRecipe({
        id: 1,
        name: 'Spicy Thai Curry',
        category: 'Main',
        base_yield: 10,
        portion_size: '350g',
        notes: 'Best served with jasmine rice and fresh cilantro.',
        ingredients: [
          { name: 'Chicken Breast', quantity: 1.5, unit: 'kg', price: 800 },
          { name: 'Coconut Milk', quantity: 0.8, unit: 'litres', price: 400 },
          { name: 'Curry Paste', quantity: 0.2, unit: 'kg', price: 1200 },
          { name: 'Mixed Vegetables', quantity: 1.2, unit: 'kg', price: 300 },
        ],
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading || !recipe) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F9FAFB',
        }}
      >
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  const scaleFactor = parseFloat(requiredYield) / recipe.base_yield || 1;
  const totalCost = recipe.ingredients.reduce(
    (acc: number, ing: any) => acc + ing.quantity * ing.price,
    0
  );
  const currentTotalCost = totalCost * scaleFactor;
  const costPerPortion = totalCost / recipe.base_yield;

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB', paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>{recipe.name}</Text>
          <Text style={{ fontSize: 13, color: '#6B7280' }}>
            {recipe.category} • Base: {recipe.base_yield} portions
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Scaling Engine */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Scale size={18} color="#2563EB" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
              Scaling Engine
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                Required Portions
              </Text>
              <TextInput
                value={requiredYield}
                onChangeText={setRequiredYield}
                keyboardType="numeric"
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  paddingHorizontal: 12,
                  height: 44,
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#111827',
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Scale Factor</Text>
              <View style={{ height: 44, justifyContent: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#6B7280' }}>
                  x{scaleFactor.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Costing Engine */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>TOTAL COST</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
              KSh {currentTotalCost.toLocaleString()}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>PER PORTION</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#2563EB' }}>
              KSh {costPerPortion.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Selling Price Calculator */}
        <View
          style={{
            backgroundColor: '#F0F9FF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#BAE6FD',
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <DollarSign size={18} color="#0369A1" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0369A1' }}>
              Profit Margin Models
            </Text>
          </View>
          <View style={{ gap: 8 }}>
            {[30, 35, 40].map((margin) => (
              <View
                key={margin}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, color: '#0369A1' }}>{margin}% Food Cost</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#0369A1' }}>
                  KSh {(costPerPortion / (margin / 100)).toFixed(0)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ingredients List */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            padding: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <ListTodo size={18} color="#2563EB" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
              Required Ingredients
            </Text>
          </View>
          {recipe.ingredients.map((ing: any, i: number) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: i === recipe.ingredients.length - 1 ? 0 : 1,
                borderBottomColor: '#F3F4F6',
              }}
            >
              <View>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827' }}>
                  {ing.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>
                  Base: {ing.quantity} {ing.unit}
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                {(ing.quantity * scaleFactor).toFixed(2)} {ing.unit}
              </Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        {recipe.notes && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: '#F9FAFB',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderStyle: 'dashed',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Info size={16} color="#6B7280" />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B7280' }}>
                Chef's Notes
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 20 }}>{recipe.notes}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
