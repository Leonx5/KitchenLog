import { Tabs } from 'expo-router';
import {
  BookOpen,
  ClipboardList,
  Home,
  Package,
  Utensils,
} from 'lucide-react-native';
import { Colors } from '@/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FDFCFB', // Ivory Active
        tabBarInactiveTintColor: 'rgba(212, 163, 115, 0.7)', // Warm Gold Inactive
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(15, 26, 21, 0.95)', // Deeper Forest Glass
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 88,
          borderTopWidth: 1,
          borderTopColor: 'rgba(212, 163, 115, 0.1)',
          elevation: 0,
          paddingBottom: 24,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Home color={color} size={26} />
          ),
        }}
      />

      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color }) => (
            <BookOpen color={color} size={26} />
          ),
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Stock',
          tabBarIcon: ({ color }) => (
            <Package color={color} size={26} />
          ),
        }}
      />

      <Tabs.Screen
        name="menus"
        options={{
          title: 'Menus',
          tabBarIcon: ({ color }) => (
            <ClipboardList color={color} size={26} />
          ),
        }}
      />

      <Tabs.Screen
        name="ingredients"
        options={{
          title: 'Items',
          tabBarIcon: ({ color }) => (
            <Utensils color={color} size={26} />
          ),
        }}
      />
    </Tabs>
  );
}
