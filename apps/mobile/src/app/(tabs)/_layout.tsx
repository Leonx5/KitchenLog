import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />

      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
        }}
      />

      <Tabs.Screen
        name="menus"
        options={{
          title: 'Menus',
        }}
      />

      <Tabs.Screen
        name="ingredients"
        options={{
          title: 'Ingredients',
        }}
      />
    </Tabs>
  );
}