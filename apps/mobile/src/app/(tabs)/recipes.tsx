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
  addRecipe,
  deleteRecipe,
  getRecipes,
  updateRecipe,
} from '@/utils/database';

type Recipe = {
  id: number;
  name: string;
  category: string | null;
  portions: number;
};

export default function RecipesScreen() {
  const insets = useSafeAreaInsets();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const loadRecipes = () => {
    const data = getRecipes();
    setRecipes(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const handleAddRecipe = () => {
    addRecipe('Test Recipe', 'Test', 4);
    loadRecipes();
  };

  const handleDeleteRecipe = (id: number) => {
    deleteRecipe(id);
    loadRecipes();
  };

  const handleEditRecipe = (id: number) => {
    updateRecipe(id, 'Edited Recipe');
    loadRecipes();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipes</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
            <Text style={styles.buttonText}>Add Recipe</Text>
          </TouchableOpacity>

          {recipes.map((recipe) => (
            <View key={recipe.id} style={styles.card}>
              <Text style={styles.name}>{recipe.name}</Text>
              <Text style={styles.detail}>Category: {recipe.category}</Text>
              <Text style={styles.detail}>Portions: {recipe.portions}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditRecipe(recipe.id)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteRecipe(recipe.id)}
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
    backgroundColor: '#2563EB',
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
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  container: {
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#2563EB',
    borderRadius: 8,
    flex: 1,
    padding: 10,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  name: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  scroll: {
    flex: 1,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '600',
  },
});
