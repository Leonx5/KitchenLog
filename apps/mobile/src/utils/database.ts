import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('prepflow.db');

export function initializeDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      unit TEXT,
      cost_per_unit REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ingredient_id INTEGER,
      quantity REAL DEFAULT 0,
      minimum_quantity REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      portions INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      recipe_id INTEGER,
      ingredient_id INTEGER,
      quantity REAL
    );

    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      event_date TEXT
    );

    CREATE TABLE IF NOT EXISTS menu_recipes (
      menu_id INTEGER,
      recipe_id INTEGER,
      servings INTEGER DEFAULT 1
    );
  `);
}
export function getIngredients() {
  return db.getAllSync(
    `SELECT * FROM ingredients ORDER BY name`
  );
}

export function addIngredient(
  name: string,
  category: string,
  unit: string,
  costPerUnit: number
) {
  db.runSync(
    `INSERT INTO ingredients
      (name, category, unit, cost_per_unit)
     VALUES (?, ?, ?, ?)`,
    [name, category, unit, costPerUnit]
  );
}
export function seedIngredients() {
  const existing = db.getFirstSync(
    `SELECT COUNT(*) as count FROM ingredients`
  ) as any;

  if (existing?.count > 0) {
    return;
  }

  addIngredient('Chicken Breast', 'Protein', 'kg', 800);
  addIngredient('Basmati Rice', 'Grain', 'kg', 250);
  addIngredient('Olive Oil', 'Pantry', 'litres', 1200);
  addIngredient('Onions', 'Vegetables', 'kg', 120);
}

console.log('INGREDIENTS TEST:', getIngredients());