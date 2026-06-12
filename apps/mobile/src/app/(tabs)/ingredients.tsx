import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  addIngredient,
  deleteIngredient,
  getIngredients,
} from '@/utils/database';

type Ingredient = {
  id: number;
  name: string;
  category: string | null;
  unit: string | null;
  cost_per_unit: number;
};

export default function IngredientsScreen() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const refreshIngredients = useCallback(() => {
    try {
      const data = getIngredients();
      setIngredients(Array.isArray(data) ? (data as Ingredient[]) : []);
    } catch (error) {
      console.error('INGREDIENTS ERROR:', error);
      setIngredients([]);
    }
  }, []);

  useEffect(() => {
    refreshIngredients();
  }, [refreshIngredients]);

  const handleAddIngredient = () => {
    addIngredient('Test Ingredient', 'Test', 'kg', 100);
    refreshIngredients();
  };

  const handleDeleteIngredient = (id: number) => {
    deleteIngredient(id);
    refreshIngredients();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ingredients</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
        <Text style={styles.buttonText}>+ Add Test Ingredient</Text>
      </TouchableOpacity>

      {ingredients.map((item) => (
        <View key={item.id} style={styles.ingredientCard}>
          <Text>{item.name}</Text>
          <Text>{item.category}</Text>
          <Text>{item.unit}</Text>
          <Text>KSh {item.cost_per_unit}</Text>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteIngredient(item.id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    marginBottom: 20,
    padding: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    borderRadius: 6,
    marginTop: 10,
    padding: 8,
  },
  ingredientCard: {
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
