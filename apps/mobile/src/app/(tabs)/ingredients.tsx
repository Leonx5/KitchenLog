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
import { AnimatedButton, FadeInView } from '@/components/AnimatedWrappers';
import { Tag, Plus, X } from 'lucide-react-native';

type Ingredient = {
  id: number;
  name: string;
  category: string | null;
  unit: string | null;
  cost_per_unit: number;
  aliases?: string;
};

const AliasChip = ({ id, alias, onDelete }: { id: number; alias: string; onDelete: (id: number) => void }) => (
  <View style={{
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.3)',
    marginRight: 8,
    marginBottom: 8,
  }}>
    <Text style={{ fontSize: 12, color: '#D4A373', fontWeight: '500' }}>{alias}</Text>
    <TouchableOpacity onPress={() => onDelete(id)}>
      <X size={12} color="#D4A373" />
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

  // Only refetch if ingredient.id changes (though mostly handled by prefetched state now)
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{ingredient.name}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Text style={styles.detail}>{ingredient.category}</Text>
            <Text style={styles.detail}>•</Text>
            <Text style={styles.detail}>{ingredient.unit}</Text>
            <Text style={styles.detail}>•</Text>
            <Text style={styles.detail}>KSh {ingredient.cost_per_unit}</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => setShowAliasInput(!showAliasInput)}
          style={{ padding: 4 }}
        >
          <Tag size={18} color={showAliasInput ? Colors.primary : Colors.accent} />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {aliases.map((a) => (
          <AliasChip key={a.id} id={a.id} alias={a.alias} onDelete={handleDeleteAlias} />
        ))}
      </View>

      {showAliasInput && (
        <FadeInView style={{ flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, paddingVertical: 8, paddingHorizontal: 12, fontSize: 13, backgroundColor: '#FFF' }]}
            placeholder="Add Alias (e.g. Scallions)"
            placeholderTextColor="#94A3B8"
            value={newAlias}
            onChangeText={setNewAlias}
            autoFocus
          />
          <TouchableOpacity 
            onPress={handleAddAlias}
            style={{ backgroundColor: Colors.primary, borderRadius: 8, padding: 10 }}
          >
            <Plus size={16} color="white" />
          </TouchableOpacity>
        </FadeInView>
      )}

      <View style={styles.actions}>
        <AnimatedButton
          style={styles.editButton}
          onPress={() => onEdit(ingredient.id)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </AnimatedButton>

        <AnimatedButton
          style={styles.deleteButton}
          onPress={() => onDelete(ingredient.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </AnimatedButton>
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
    
    console.log('SAVE START');
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
      console.log('SAVE END');
    } catch (e) {
      console.log('SAVE ERROR', e);
      console.error('FULL ERROR', JSON.stringify(e));
    }
  };

  const handleDeleteIngredient = (id: number) => {
    console.log('DELETE START');
    try {
      deleteIngredient(id);
      setIngredients(prev => prev.filter(ing => ing.id !== id));
      console.log('DELETE END');
    } catch (e) {
      console.log('DELETE ERROR', e);
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
        <Text style={styles.title}>Ingredients</Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {!isCreating ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              console.log('ADD PRESSED');
              setIsCreating(true);
            }}
          >
            <Text style={styles.buttonText}>Add Ingredient</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.formCard}>
            <Text>FORM TEST</Text>
            <TextInput
              style={styles.input}
              placeholder="TEST INPUT"
            />
          </View>
        )}
      </View>

      <FlatList
        data={ingredients}
        keyExtractor={(item) => item.id.toString()}
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: 0 }]}
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
