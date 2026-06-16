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
import { ChevronLeft, Scale, DollarSign, ListTodo, Info, Plus, Trash2 } from 'lucide-react-native';
import {
  getRecipe,
  getRecipeIngredients,
  getIngredients,
  addIngredientToRecipe,
  removeIngredientFromRecipe,
} from '@/utils/database';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const recipeId = Number(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [requiredYield, setRequiredYield] = useState('10');
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<any>(null);
  const [ingredients, setIngredients] = useState<any[]>([]);

  const loadData = () => {
    const recipeData = getRecipe(recipeId);
    const linkedIngredients = getRecipeIngredients(recipeId);
    setRecipe(recipeData);
    setIngredients(linkedIngredients);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [recipeId]);

  const handleAddFirstIngredient = () => {
    const allIngredients = getIngredients();
    if (allIngredients && allIngredients.length > 0) {
      // Check if already linked
      const alreadyLinked = ingredients.some(ing => ing.ingredient_id === allIngredients[0].id);
      if (!alreadyLinked) {
        addIngredientToRecipe(recipeId, allIngredients[0].id, 1);
        loadData();
      }
    }
  };

  const handleRemoveIngredient = (ingredientId: number) => {
    removeIngredientFromRecipe(recipeId, ingredientId);
    loadData();
  };

  if (loading || !recipe) {
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

  // Use base portions from database
  const baseYield = recipe.portions || 1;
  const scaleFactor = parseFloat(requiredYield) / baseYield || 1;
  
  // Costing calculations (simplified as per requirements, but still using real ingredients)
  const costPerPortion = 0; // Will be implemented in future milestone
  const currentTotalCost = 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F5F0', paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#D4A373',
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>{recipe.name}</Text>
          <Text style={{ fontSize: 13, color: '#6B7280' }}>
            {recipe.category} • Base: {baseYield} portions
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
            borderColor: '#D4A373',
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Scale size={18} color="#1B4332" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
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
                  backgroundColor: '#F8F5F0',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#D4A373',
                  paddingHorizontal: 12,
                  height: 44,
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#1F2937',
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

        {/* Costing Engine (Placeholders as per requirements) */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#D4A373',
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>TOTAL COST</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
              KSh {currentTotalCost.toLocaleString()}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#D4A373',
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>PER PORTION</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1B4332' }}>
              KSh {costPerPortion.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Ingredients List */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#D4A373',
            padding: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ListTodo size={18} color="#1B4332" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
                Required Ingredients
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleAddFirstIngredient}
              style={{ backgroundColor: '#1B4332', borderRadius: 8, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Plus size={14} color="white" />
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Add First</Text>
            </TouchableOpacity>
          </View>

          {ingredients.length === 0 ? (
            <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', paddingVertical: 20 }}>
              No ingredients added to this recipe yet.
            </Text>
          ) : (
            ingredients.map((ing: any, i: number) => (
              <View
                key={ing.ingredient_id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: i === ingredients.length - 1 ? 0 : 1,
                  borderBottomColor: '#F3F4F6',
                }}
              >
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                    {ing.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    Base: {ing.quantity} {ing.unit}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
                    {(ing.quantity * scaleFactor).toFixed(2)} {ing.unit}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveIngredient(ing.ingredient_id)}>
                    <Trash2 size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Notes */}
        {recipe.notes && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: '#F8F5F0',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: '#D4A373',
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
