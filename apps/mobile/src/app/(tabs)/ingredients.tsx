import React, { useEffect, useState, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  addIngredient,
  deleteIngredient,
  getIngredients,
  updateIngredient,
  getIngredientAliases,
  addIngredientAlias,
  deleteIngredientAlias,
} from '@/utils/database';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { FadeInView } from '@/components/AnimatedWrappers';
import { Tag, Plus, X, Package, DollarSign, Edit3, Trash2 } from 'lucide-react-native';

const DARK_FOREST = '#0F1A15';
const IVORY = '#FDFCFB';
const DARK_OLIVE = '#1C2620';
const SOFT_SAND = 'rgba(212, 163, 115, 0.9)';

type Ingredient = {
  id: number;
  name: string;
  category: string | null;
  unit: string | null;
  cost_per_unit: number;
  aliases?: string;
};

const AliasChip = ({ id, alias, onDelete }: { id: number; alias: string; onDelete: (id: number) => void }) => (
  <View style={styles.aliasChip}>
    <Text style={styles.aliasChipText}>{alias}</Text>
    <TouchableOpacity onPress={() => onDelete(id)}>
      <X size={10} color={Colors.accent} />
    </TouchableOpacity>
  </View>
);

const IngredientCard = ({ ingredient, onDelete, onEdit }: { 
  ingredient: Ingredient; 
  onDelete: (id: number) => void; 
  onEdit: (id: number) => void 
}) => {
  const initialAliases = useMemo(() => 
    ingredient.aliases ? JSON.parse(ingredient.aliases) : [],
    [ingredient.aliases]
  );
  const [aliases, setAliases] = useState<any[]>(initialAliases);
  const [newAlias, setNewAlias] = useState('');
  const [showAliasInput, setShowAliasInput] = useState(false);

  const loadAliases = () => {
    const data = getIngredientAliases(ingredient.id);
    setAliases(data);
  };

  useEffect(() => {
    setAliases(initialAliases);
  }, [ingredient.id, ingredient.aliases]);

  const handleAddAlias = () => {
    if (newAlias.trim().length < 2) return;
    addIngredientAlias(ingredient.id, newAlias.trim());
    setNewAlias('');
    setShowAliasInput(false);
    loadAliases();
  };

  const handleDeleteAlias = (id: number) => {
    deleteIngredientAlias(id);
    loadAliases();
  };

  return (
    <FadeInView style={styles.card} duration={200}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <Package size={16} color={Colors.accent} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.ingredientName}>{ingredient.name}</Text>
          <View style={styles.ingredientMetaRow}>
            <Text style={styles.ingredientMeta}>{ingredient.category}</Text>
            <Text style={styles.ingredientDot}>•</Text>
            <Text style={styles.ingredientMeta}>{ingredient.unit}</Text>
            <Text style={styles.ingredientDot}>•</Text>
            <Text style={styles.ingredientMeta}>KSh {ingredient.cost_per_unit}</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => setShowAliasInput(!showAliasInput)}
          style={styles.aliasToggle}
        >
          <Tag size={16} color={showAliasInput ? Colors.accent : IVORY} opacity={showAliasInput ? 1 : 0.3} />
        </TouchableOpacity>
      </View>

      {aliases.length > 0 && (
        <View style={styles.aliasRow}>
          {aliases.map((a) => (
            <AliasChip key={a.id} id={a.id} alias={a.alias} onDelete={handleDeleteAlias} />
          ))}
        </View>
      )}

      {showAliasInput && (
        <FadeInView style={styles.aliasInputRow}>
          <TextInput
            style={styles.aliasInput}
            placeholder="Add alias (e.g. Scallions)"
            placeholderTextColor="rgba(253,252,251,0.25)"
            value={newAlias}
            onChangeText={setNewAlias}
            autoFocus
          />
          <TouchableOpacity style={styles.aliasAddBtn} onPress={handleAddAlias}>
            <Plus size={14} color={DARK_FOREST} />
          </TouchableOpacity>
        </FadeInView>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(ingredient.id)}>
          <Edit3 size={12} color={Colors.accent} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(ingredient.id)}>
          <Trash2 size={12} color="#FF6B6B" />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </FadeInView>
  );
};

export default function IngredientsScreen() {
  const insets = useSafeAreaInsets();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState({
    name: '',
    category: '',
    unit: '',
    cost: '',
  });

  const loadIngredients = () => {
    const data = getIngredients();
    setIngredients(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const handleSaveIngredient = () => {
    if (draft.name.trim().length < 2) return;
    
    try {
      const name = draft.name.trim();
      const category = draft.category.trim() || 'General';
      const unit = draft.unit.trim() || 'kg';
      const cost = parseFloat(draft.cost) || 0;

      const result = addIngredient(name, category, unit, cost);
      
      const newIngredient: Ingredient = {
        id: result.lastInsertRowId,
        name,
        category,
        unit,
        cost_per_unit: cost,
        aliases: '[]'
      };

      setIngredients(prev => [...prev, newIngredient].sort((a, b) => a.name.localeCompare(b.name)));
      setDraft({ name: '', category: '', unit: '', cost: '' });
      setIsCreating(false);
    } catch (e) {
      console.error('FULL ERROR', JSON.stringify(e));
    }
  };

  const handleDeleteIngredient = (id: number) => {
    try {
      deleteIngredient(id);
      setIngredients(prev => prev.filter(ing => ing.id !== id));
    } catch (e) {
      console.error('DELETE ERROR', e);
    }
  };

  const handleEditIngredient = (id: number) => {
    updateIngredient(id, 'Updated Ingredient');
    loadIngredients();
  };

  const isValid = draft.name.trim().length >= 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Ingredients</Text>
            <Text style={styles.headerSub}>Item library & costing</Text>
          </View>
          {!isCreating && (
            <TouchableOpacity style={styles.headerBtn} onPress={() => setIsCreating(true)}>
              <Plus size={20} color={Colors.accent} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.formContainer}>
        {!isCreating ? (
          <TouchableOpacity style={styles.addButton} onPress={() => setIsCreating(true)}>
            <Plus size={16} color={DARK_FOREST} />
            <Text style={styles.addButtonText}>Add Ingredient</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>NEW INGREDIENT</Text>
            <Text>FORM TEST</Text>
          </View>
        )}
      </View>

      <FlatList
        data={ingredients}
        keyExtractor={(item) => item.id.toString()}
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: 0 }]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Package size={32} color={IVORY} opacity={0.15} />
            <Text style={styles.emptyText}>No ingredients yet</Text>
            <Text style={styles.emptyHint}>Add ingredients to build your library</Text>
          </View>
        }
        renderItem={({ item }) => (
          <IngredientCard
            ingredient={item}
            onDelete={handleDeleteIngredient}
            onEdit={handleEditIngredient}
          />
        )}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DARK_FOREST,
    flex: 1,
  },
  header: {
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
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  addButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
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
    marginBottom: 16,
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
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
  },
  cardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  ingredientName: {
    color: IVORY,
    fontSize: 16,
    fontWeight: '600',
  },
  ingredientMetaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  ingredientMeta: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
  },
  ingredientDot: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.15,
  },
  aliasToggle: {
    padding: 6,
  },
  aliasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  aliasChip: {
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.2)',
    marginRight: 8,
    marginBottom: 8,
  },
  aliasChipText: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '500',
  },
  aliasInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  aliasInput: {
    flex: 1,
    backgroundColor: 'rgba(15, 26, 21, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: IVORY,
    fontSize: 13,
  },
  aliasAddBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    padding: 10,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 163, 115, 0.05)',
    paddingTop: 12,
    marginTop: 12,
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
});
