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
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { AnimatedButton, FadeInView } from '@/components/AnimatedWrappers';

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
          <AnimatedButton style={styles.addButton} onPress={handleAddIngredient}>
            <Text style={styles.buttonText}>Add Ingredient</Text>
          </AnimatedButton>

          {ingredients.map((ingredient) => (
            <FadeInView key={ingredient.id} style={styles.card} duration={200}>
              <Text style={styles.name}>{ingredient.name}</Text>
              <Text style={styles.detail}>Category: {ingredient.category}</Text>
              <Text style={styles.detail}>Unit: {ingredient.unit}</Text>
              <Text style={styles.detail}>Cost: KSh {ingredient.cost_per_unit}</Text>

              <View style={styles.actions}>
                <AnimatedButton
                  style={styles.editButton}
                  onPress={() => handleEditIngredient(ingredient.id)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </AnimatedButton>

                <AnimatedButton
                  style={styles.deleteButton}
                  onPress={() => handleDeleteIngredient(ingredient.id)}
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
