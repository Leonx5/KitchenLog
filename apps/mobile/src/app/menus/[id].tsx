import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ShoppingCart,
  Printer,
  ChefHat,
  PackageCheck,
  TrendingDown,
} from 'lucide-react-native';

export default function MenuDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('production'); // production or shopping

  useEffect(() => {
    setTimeout(() => {
      setMenu({
        id: 1,
        name: 'Corporate Gala',
        event_type: 'Dinner Event',
        target_date: 'June 12, 2026',
        items: [
          { recipe_name: 'Spicy Thai Curry', portions_required: 250 },
          { recipe_name: 'Caesar Salad', portions_required: 250 },
          { recipe_name: 'Chocolate Mousse', portions_required: 250 },
        ],
        groceryList: [
          {
            name: 'Chicken Breast',
            unit: 'kg',
            required: 37.5,
            in_stock: 2.5,
            deficit: 35.0,
            price: 800,
          },
          {
            name: 'Basmati Rice',
            unit: 'kg',
            required: 25.0,
            in_stock: 45.0,
            deficit: -20.0,
            price: 250,
          },
          {
            name: 'Heavy Cream',
            unit: 'litres',
            required: 15.0,
            in_stock: 1.2,
            deficit: 13.8,
            price: 600,
          },
          {
            name: 'Coconut Milk',
            unit: 'litres',
            required: 20.0,
            in_stock: 5.0,
            deficit: 15.0,
            price: 400,
          },
        ],
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading || !menu) {
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

  const totalCost = menu.groceryList.reduce((acc: number, item: any) => {
    const purchaseAmount = Math.max(0, item.deficit);
    return acc + purchaseAmount * item.price;
  }, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB', paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>{menu.name}</Text>
            <Text style={{ fontSize: 13, color: '#6B7280' }}>
              {menu.event_type} • {menu.target_date}
            </Text>
          </View>
        </View>

        {/* Tab switcher - Ghost Style */}
        <View style={{ flexDirection: 'row', gap: 24, marginTop: 12 }}>
          {['production', 'shopping'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingBottom: 12,
                borderBottomWidth: 2,
                borderBottomColor: activeTab === tab ? '#2563EB' : 'transparent',
                marginBottom: -13, // Overlap border
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: activeTab === tab ? '600' : '500',
                  color: activeTab === tab ? '#111827' : '#6B7280',
                  textTransform: 'capitalize',
                }}
              >
                {tab}
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
        {activeTab === 'production' ? (
          <>
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
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}
              >
                <ChefHat size={18} color="#2563EB" />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                  Recipe Requirements
                </Text>
              </View>
              {menu.items.map((item: any, i: number) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: i === menu.items.length - 1 ? 0 : 1,
                    borderBottomColor: '#F3F4F6',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827' }}>
                    {item.recipe_name}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#2563EB' }}>
                    {item.portions_required} Portions
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                padding: 16,
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}
              >
                <PackageCheck size={18} color="#2563EB" />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                  Consolidated Prep Totals
                </Text>
              </View>
              {menu.groceryList.map((item: any, i: number) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: i === menu.groceryList.length - 1 ? 0 : 1,
                    borderBottomColor: '#F3F4F6',
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#374151' }}>{item.name}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                    {item.required} {item.unit}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
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
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: '#0369A1',
                      textTransform: 'uppercase',
                    }}
                  >
                    EST. PURCHASING COST
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#0369A1', marginTop: 4 }}>
                    KSh {totalCost.toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 8,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: '#BAE6FD',
                  }}
                >
                  <Printer size={20} color="#0369A1" />
                </TouchableOpacity>
              </View>
            </View>

            {menu.groceryList.map((item: any, i: number) => {
              const purchaseAmount = Math.max(0, item.deficit);
              const cost = purchaseAmount * item.price;

              return (
                <View
                  key={i}
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
                      marginBottom: 8,
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        Req: {item.required} {item.unit} • In Stock: {item.in_stock} {item.unit}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: purchaseAmount > 0 ? '#111827' : '#16A34A',
                        }}
                      >
                        {purchaseAmount > 0 ? `${purchaseAmount} ${item.unit}` : 'Stock Sufficient'}
                      </Text>
                      {purchaseAmount > 0 && (
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                          KSh {cost.toLocaleString()}
                        </Text>
                      )}
                    </View>
                  </View>
                  {purchaseAmount > 0 && (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}
                    >
                      <TrendingDown size={14} color="#EF4444" />
                      <Text style={{ fontSize: 11, fontWeight: '500', color: '#EF4444' }}>
                        Deficit: {item.deficit} {item.unit}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: activeTab === 'shopping' ? '#2563EB' : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 24,
            borderWidth: activeTab === 'shopping' ? 0 : 1,
            borderColor: '#E5E7EB',
            gap: 8,
          }}
        >
          {activeTab === 'shopping' ? (
            <>
              <ShoppingCart size={20} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                Export Shopping List
              </Text>
            </>
          ) : (
            <>
              <Printer size={20} color="#111827" />
              <Text style={{ color: '#111827', fontSize: 16, fontWeight: '600' }}>
                Print Production Sheet
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
