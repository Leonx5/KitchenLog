import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  addIngredient,
  deleteIngredient,
  getIngredients,
  updateIngredient,
} from '@/utils/database';

type Ingredient = {
  id: number;
  name: string;
  category: string | null;
  unit: string | null;
  cost_per_unit: number;
};

export default function IngredientsScreen() {
  const insets = useSafeAreaInsets();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const loadIngredients = () => {
    const data = getIngredients();
    setIngredients(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const handleAddIngredient = () => {
    addIngredient('Ingredient', 'Test', 'kg', 100);
    loadIngredients();
  };

  const handleDeleteIngredient = (id: number) => {
    deleteIngredient(id);
    loadIngredients();
  };

  const handleEditIngredient = (id: number) => {
    updateIngredient(id, 'Updated Ingredient');
    loadIngredients();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Ingredients</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
            <Text style={styles.buttonText}>Add Ingredient</Text>
          </TouchableOpacity>

          {ingredients.map((ingredient) => (
            <View key={ingredient.id} style={styles.card}>
              <Text style={styles.name}>{ingredient.name}</Text>
              <Text style={styles.detail}>Category: {ingredient.category}</Text>
              <Text style={styles.detail}>Unit: {ingredient.unit}</Text>
              <Text style={styles.detail}>Cost: KSh {ingredient.cost_per_unit}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditIngredient(ingredient.id)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteIngredient(ingredient.id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  addButton: {
    backgroundColor: '#1B4332',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderColor: '#D4A373',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  container: {
    backgroundColor: '#F8F5F0',
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    padding: 10,
  },
  detail: {
    color: '#4B5563',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 8,
    flex: 1,
    padding: 10,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#D4A373',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  name: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  scroll: {
    flex: 1,
  },
  title: {
    color: '#1F2937',
    fontSize: 24,
    fontWeight: '600',
  },
});
