import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { getIngredients, addIngredient } from '@/utils/database';

export default function IngredientsScreen() {
  const [ingredients, setIngredients] = useState<any[]>([]);

  useEffect(() => {
    try {
      const data = getIngredients();

      console.log('INGREDIENTS SCREEN DATA:', data);

      setIngredients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('INGREDIENTS ERROR:', error);
    }
  }, []);
  const handleAddIngredient = () => {
  addIngredient(
    'Test Ingredient',
    'Test',
    'kg',
    100
  );

  const data = getIngredients();

console.log('AFTER INSERT:', data);

setIngredients(Array.isArray(data) ? data : []);
};
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
        }}
      >
        Ingredients
      </Text>
      <TouchableOpacity
  onPress={handleAddIngredient}
  style={{
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  }}
>
  <Text
    style={{
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
    }}
  >
    + Add Test Ingredient
  </Text>
</TouchableOpacity>
      {ingredients.map((item) => (
        <View
          key={item.id}
          style={{
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
          }}
        >
          <Text>{item.name}</Text>
          <Text>{item.category}</Text>
          <Text>{item.unit}</Text>
          <Text>KSh {item.cost_per_unit}</Text>
        </View>
      ))}
    </ScrollView>
  );
}