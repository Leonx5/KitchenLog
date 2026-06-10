import { Stack } from 'expo-router';
import { useEffect } from 'react';
import {
  initializeDatabase,
  seedIngredients,
} from '@/utils/database';

export default function RootLayout() {
  useEffect(() => {
  initializeDatabase();
  seedIngredients();
}, []);

  return <Stack />;
}