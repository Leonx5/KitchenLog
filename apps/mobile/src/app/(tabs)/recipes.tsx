import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
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
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState({
    name: '',
    category: '',
    portions: '1',
  });

  const loadRecipes = () => {
    const data = getRecipes();
    setRecipes(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const handleSaveRecipe = () => {
    if (draft.name.trim().length < 3) return;
    
    try {
      addRecipe(
        draft.name.trim(), 
        draft.category.trim() || 'General', 
        parseInt(draft.portions) || 1
      );
      
      setDraft({ name: '', category: '', portions: '1' });
      setIsCreating(false);
      loadRecipes();
    } catch (e) {
      console.error('FULL ERROR', JSON.stringify(e));
    }
  };

  const handleDeleteRecipe = (id: number) => {
    deleteRecipe(id);
    loadRecipes();
  };

  const handleEditRecipe = (id: number) => {
    updateRecipe(id, 'Updated Recipe');
    loadRecipes();
  };

  const isValid = draft.name.trim().length >= 3;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipes</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View>
          {!isCreating ? (
            <AnimatedButton style={styles.addButton} onPress={() => setIsCreating(true)}>
              <Text style={styles.buttonText}>Add Recipe</Text>
            </AnimatedButton>
          ) : (
            <View style={styles.formCard}>
              <Text>FORM TEST</Text>
            </View>
          )}

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
  formCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
    color: Colors.text,
    fontFamily: Typography.body.fontFamily,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
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
