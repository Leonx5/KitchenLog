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
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { AnimatedButton, FadeInView } from '@/components/AnimatedWrappers';

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
    addRecipe('New Recipe', 'Main Course', 4);
    loadRecipes();
  };

  const handleDeleteRecipe = (id: number) => {
    deleteRecipe(id);
    loadRecipes();
  };

  const handleEditRecipe = (id: number) => {
    updateRecipe(id, 'Updated Recipe');
    loadRecipes();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipes</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View>
          <AnimatedButton style={styles.addButton} onPress={handleAddRecipe}>
            <Text style={styles.buttonText}>Add Recipe</Text>
          </AnimatedButton>

          {recipes.map((recipe) => (
            <FadeInView key={recipe.id} style={styles.card} duration={200}>
              <Text style={styles.name}>{recipe.name}</Text>
              <Text style={styles.detail}>Category: {recipe.category}</Text>
              <Text style={styles.detail}>Portions: {recipe.portions}</Text>

              <View style={styles.actions}>
                <AnimatedButton
                  style={styles.editButton}
                  onPress={() => handleEditRecipe(recipe.id)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </AnimatedButton>

                <AnimatedButton
                  style={styles.deleteButton}
                  onPress={() => handleDeleteRecipe(recipe.id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </AnimatedButton>
              </View>
            </FadeInView>
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
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  buttonText: {
    ...Typography.buttonText,
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  deleteButton: {
    backgroundColor: Colors.destructive,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    padding: 10,
  },
  detail: {
    ...Typography.bodyText,
    color: '#4B5563',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    flex: 1,
    padding: 10,
  },
  header: {
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  name: {
    ...Typography.cardTitle,
    color: Colors.text,
    marginBottom: 4,
  },
  scroll: {
    flex: 1,
  },
  title: {
    ...Typography.screenTitle,
    color: Colors.text,
  },
});
