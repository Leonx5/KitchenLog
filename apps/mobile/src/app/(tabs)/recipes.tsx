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
import { FadeInView } from '@/components/AnimatedWrappers';
import { BookOpen, Plus, Trash2, Edit3 } from 'lucide-react-native';

const DARK_FOREST = '#0F1A15';
const IVORY = '#FDFCFB';
const DARK_OLIVE = '#1C2620';
const SOFT_SAND = 'rgba(212, 163, 115, 0.9)';

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
        <View style={styles.headerRow}>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Recipes</Text>
            <Text style={styles.headerSub}>Recipe library & costing</Text>
          </View>
          {!isCreating && (
            <TouchableOpacity style={styles.headerBtn} onPress={() => setIsCreating(true)}>
              <Plus size={20} color={Colors.accent} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View>
          {!isCreating ? (
            <TouchableOpacity style={styles.addButton} onPress={() => setIsCreating(true)}>
              <Plus size={16} color={DARK_FOREST} />
              <Text style={styles.addButtonText}>Add Recipe</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>NEW RECIPE</Text>
              <Text>FORM TEST</Text>
            </View>
          )}

          {recipes.length === 0 && !isCreating && (
            <View style={styles.emptyState}>
              <BookOpen size={32} color={IVORY} opacity={0.15} />
              <Text style={styles.emptyText}>No recipes yet</Text>
              <Text style={styles.emptyHint}>Tap "Add Recipe" to create one</Text>
            </View>
          )}

          {recipes.map((recipe) => (
            <FadeInView key={recipe.id} style={styles.card} duration={200}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconWrap}>
                  <BookOpen size={16} color={Colors.accent} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  <Text style={styles.recipeCategory}>{recipe.category}</Text>
                </View>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.metaLabel}>Portions</Text>
                <Text style={styles.metaValue}>{recipe.portions}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleEditRecipe(recipe.id)}
                >
                  <Edit3 size={12} color={Colors.accent} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteRecipe(recipe.id)}
                >
                  <Trash2 size={12} color="#FF6B6B" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </FadeInView>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DARK_FOREST,
    flex: 1,
  },
  header: {
    backgroundColor: DARK_FOREST,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 163, 115, 0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    color: IVORY,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSub: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
    marginTop: 1,
    letterSpacing: 0.3,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: DARK_OLIVE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  addButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  addButtonText: {
    color: DARK_FOREST,
    fontSize: 13,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.12)',
    marginBottom: 20,
  },
  formTitle: {
    color: SOFT_SAND,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 16,
    opacity: 0.7,
  },
  input: {
    backgroundColor: 'rgba(15, 26, 21, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
    padding: 12,
    marginBottom: 10,
    color: IVORY,
    fontSize: 14,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.15)',
  },
  cancelBtnText: {
    color: IVORY,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: DARK_FOREST,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    color: IVORY,
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.3,
  },
  emptyHint: {
    color: IVORY,
    fontSize: 12,
    opacity: 0.2,
  },
  card: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  recipeName: {
    color: IVORY,
    fontSize: 16,
    fontWeight: '600',
  },
  recipeCategory: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
    marginTop: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  metaLabel: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 163, 115, 0.05)',
    paddingTop: 12,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.15)',
  },
  editBtnText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  deleteBtnText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
});
