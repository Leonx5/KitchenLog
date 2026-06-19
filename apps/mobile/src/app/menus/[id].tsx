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
  Plus,
  Trash2,
} from 'lucide-react-native';
import {
  getMenu,
  getMenuRecipes,
  getRecipes,
  addRecipeToMenu,
  removeRecipeFromMenu,
  getMenuShoppingList,
  setMenuStatus,
  saveMenuAsTemplate,
} from '@/utils/database';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { Copy } from 'lucide-react-native';

export default function MenuDetailScreen() {
  const { id } = useLocalSearchParams();
  const menuId = Number(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<any>(null);
  const [menuRecipes, setMenuRecipes] = useState<any[]>([]);
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('production'); // production or shopping

  const loadData = () => {
    const menuData = getMenu(menuId);
    const recipeLinks = getMenuRecipes(menuId);
    const list = getMenuShoppingList(menuId);
    setMenu(menuData);
    setMenuRecipes(recipeLinks);
    setShoppingList(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [menuId]);

  const handleSaveAsTemplate = () => {
    saveMenuAsTemplate(menuId, `${menu.name} Template`, `Created from event on ${menu.event_date}`);
    alert('Menu saved as template!');
  };

  const handleStatusTransition = () => {
    const statusFlow = ['Draft', 'Active', 'Completed'];
    const currentIndex = statusFlow.indexOf(menu.status || 'Draft');
    if (currentIndex < statusFlow.length - 1) {
      setMenuStatus(menuId, statusFlow[currentIndex + 1]);
      loadData();
    }
  };

  const handleReopen = () => {
    setMenuStatus(menuId, 'Active');
    loadData();
  };

  const handleAddFirstRecipe = () => {
    const allRecipes = getRecipes();
    if (allRecipes && allRecipes.length > 0) {
      // Check if already linked to avoid duplicates for this simple demo
      const alreadyLinked = menuRecipes.some(r => r.recipe_id === allRecipes[0].id);
      if (!alreadyLinked) {
        addRecipeToMenu(menuId, allRecipes[0].id, 50);
        loadData();
      }
    }
  };

  const handleRemoveRecipe = (recipeId: number) => {
    removeRecipeFromMenu(menuId, recipeId);
    loadData();
  };

  if (loading || !menu) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F8F5F0',
        }}
      >
        <ActivityIndicator color="#1B4332" />
      </View>
    );
  }

  // Simplified totals for Phase 1
  const groceryList: any[] = [];
  const totalCost = 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F5F0', paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#D4A373',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>{menu.name}</Text>
              <View 
                style={{ 
                  backgroundColor: menu.status === 'Completed' ? '#16A34A' : '#1B4332', 
                  borderRadius: 4, 
                  paddingHorizontal: 6, 
                  paddingVertical: 2 
                }}
              >
                <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>
                  {(menu.status || 'Draft').toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, color: '#6B7280' }}>
              Catering Event • {menu.event_date}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity 
              onPress={handleSaveAsTemplate}
              style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D4A373', borderRadius: 8, padding: 8 }}
            >
              <Copy size={18} color="#1B4332" />
            </TouchableOpacity>
            {menu.status === 'Completed' ? (
              <TouchableOpacity 
                onPress={handleReopen}
                style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D4A373', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}
              >
                <Text style={{ color: '#1B4332', fontSize: 12, fontWeight: '600' }}>Re-open</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={handleStatusTransition}
                style={{ backgroundColor: '#1B4332', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                  {menu.status === 'Active' ? 'Complete' : 'Next Stage'}
                </Text>
              </TouchableOpacity>
            )}
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
                borderBottomColor: activeTab === tab ? '#1B4332' : 'transparent',
                marginBottom: -13, // Overlap border
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: activeTab === tab ? '600' : '500',
                  color: activeTab === tab ? '#1F2937' : '#6B7280',
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
                borderColor: '#D4A373',
                padding: 16,
                marginBottom: 16,
              }}
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ChefHat size={18} color="#1B4332" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
                    Recipe Requirements
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={handleAddFirstRecipe}
                  style={{ backgroundColor: '#1B4332', borderRadius: 8, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={14} color="white" />
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Add First</Text>
                </TouchableOpacity>
              </View>

              {menuRecipes.length === 0 ? (
                <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', paddingVertical: 20 }}>
                  No recipes added to this menu yet.
                </Text>
              ) : (
                menuRecipes.map((item: any, i: number) => (
                  <View
                    key={item.recipe_id}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 10,
                      borderBottomWidth: i === menuRecipes.length - 1 ? 0 : 1,
                      borderBottomColor: '#F3F4F6',
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                        {item.name}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1B4332' }}>
                        {item.servings} Servings
                      </Text>
                      <TouchableOpacity onPress={() => handleRemoveRecipe(item.recipe_id)}>
                        <Trash2 size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#D4A373',
                padding: 16,
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}
              >
                <PackageCheck size={18} color="#1B4332" />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
                  Consolidated Prep Totals
                </Text>
              </View>
              {shoppingList.length === 0 ? (
                <Text style={{ fontSize: 13, color: '#6B7280', fontStyle: 'italic' }}>
                  No prep requirements found. Add recipes with ingredients.
                </Text>
              ) : (
                shoppingList.map((item: any, i: number) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 10,
                      borderBottomWidth: i === shoppingList.length - 1 ? 0 : 1,
                      borderBottomColor: '#F3F4F6',
                    }}
                  >
                    <Text style={{ fontSize: 14, color: '#374151' }}>{item.name}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
                      {item.total_quantity.toFixed(2)} {item.unit}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <>
            <View
              style={{
                backgroundColor: '#F8F5F0',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#D4A373',
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
                      color: '#1B4332',
                      textTransform: 'uppercase',
                    }}
                  >
                    EST. PURCHASING COST
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#1B4332', marginTop: 4 }}>
                    KSh {totalCost.toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 8,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: '#D4A373',
                  }}
                >
                  <Printer size={20} color="#1B4332" />
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#D4A373',
                padding: 16,
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}
              >
                <ShoppingCart size={18} color="#1B4332" />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
                  Shopping List
                </Text>
              </View>

              {shoppingList.length === 0 ? (
                <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', paddingVertical: 40 }}>
                  Your shopping list is empty.
                </Text>
              ) : (
                shoppingList.map((item: any, i: number) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: i === shoppingList.length - 1 ? 0 : 1,
                      borderBottomColor: '#F3F4F6',
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937' }}>
                        {item.name}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1B4332' }}>
                      {item.total_quantity.toFixed(2)} {item.unit}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: activeTab === 'shopping' ? '#1B4332' : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 24,
            borderWidth: activeTab === 'shopping' ? 0 : 1,
            borderColor: '#D4A373',
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
              <Printer size={20} color="#1B4332" />
              <Text style={{ color: '#1B4332', fontSize: 16, fontWeight: '600' }}>
                Print Production Sheet
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
