import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { getIngredients } from '@/utils/database';

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