import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('prepflow.db');

export type Ingredient = {
  id: number;
  name: string;
  category: string | null;
  unit: string | null;
  cost_per_unit: number;
};

export type Recipe = {
  id: number;
  name: string;
  category: string | null;
  portions: number;
};

export type InventoryItem = {
  id: number;
  ingredient_id: number | null;
  quantity: number;
  minimum_quantity: number;
  ingredient_name: string | null;
  category: string | null;
  unit: string | null;
};

export type Menu = {
  id: number;
  name: string;
  event_date: string | null;
};

type CountRow = {
  count: number;
};

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
  return db.getAllSync<Ingredient>(`
    SELECT *
    FROM ingredients
    ORDER BY name
  `);
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
  const existing = db.getFirstSync<CountRow>(`
    SELECT COUNT(*) as count
    FROM ingredients
  `);

  if ((existing?.count ?? 0) > 0) {
    return;
  }

  addIngredient('Chicken Breast', 'Protein', 'kg', 800);
  addIngredient('Basmati Rice', 'Grain', 'kg', 250);
  addIngredient('Olive Oil', 'Pantry', 'litres', 1200);
  addIngredient('Onions', 'Vegetables', 'kg', 120);
}

export function deleteIngredient(id: number) {
  db.runSync(
    `DELETE FROM ingredients
     WHERE id = ?`,
    [id]
  );
}

export function updateIngredient(
  id: number,
  name: string,
  category?: string,
  unit?: string,
  costPerUnit?: number
) {
  db.runSync(
    `UPDATE ingredients
     SET name = ?,
         category = COALESCE(?, category),
         unit = COALESCE(?, unit),
         cost_per_unit = COALESCE(?, cost_per_unit)
     WHERE id = ?`,
    [name, category ?? null, unit ?? null, costPerUnit ?? null, id]
  );
}

export function getRecipes() {
  return db.getAllSync<Recipe>(`
    SELECT *
    FROM recipes
    ORDER BY name
  `);
}

export function addRecipe(
  name: string,
  category: string,
  portions: number
) {
  db.runSync(
    `INSERT INTO recipes
      (name, category, portions)
     VALUES (?, ?, ?)`,
    [name, category, portions]
  );
}

export function updateRecipe(
  id: number,
  name: string,
  category?: string,
  portions?: number
) {
  db.runSync(
    `UPDATE recipes
     SET name = ?,
         category = COALESCE(?, category),
         portions = COALESCE(?, portions)
     WHERE id = ?`,
    [name, category ?? null, portions ?? null, id]
  );
}

export function deleteRecipe(id: number) {
  db.runSync(
    `DELETE FROM recipes
     WHERE id = ?`,
    [id]
  );
}

export function getInventory() {
  return db.getAllSync<InventoryItem>(`
    SELECT
      inventory.id,
      inventory.ingredient_id,
      inventory.quantity,
      inventory.minimum_quantity,
      ingredients.name as ingredient_name,
      ingredients.category,
      ingredients.unit
    FROM inventory
    LEFT JOIN ingredients
      ON ingredients.id = inventory.ingredient_id
    ORDER BY ingredients.name
  `);
}

export function addInventoryItem(
  ingredientId: number,
  quantity: number,
  minimumQuantity: number
) {
  db.runSync(
    `INSERT INTO inventory
      (ingredient_id, quantity, minimum_quantity)
     VALUES (?, ?, ?)`,
    [ingredientId, quantity, minimumQuantity]
  );
}

export function updateInventoryQuantity(id: number, quantity: number) {
  db.runSync(
    `UPDATE inventory
     SET quantity = ?
     WHERE id = ?`,
    [quantity, id]
  );
}

export function getMenus() {
  return db.getAllSync<Menu>(`
    SELECT *
    FROM menus
    ORDER BY event_date DESC
  `);
}

export function addMenu(name: string, eventDate: string) {
  db.runSync(
    `INSERT INTO menus (name, event_date)
     VALUES (?, ?)`,
    [name, eventDate]
  );
}

export function deleteMenu(id: number) {
  db.runSync(
    `DELETE FROM menus
     WHERE id = ?`,
    [id]
  );
}

export function updateMenu(id: number, name: string, eventDate: string) {
  db.runSync(
    `UPDATE menus
     SET name = ?,
         event_date = ?
     WHERE id = ?`,
    [name, eventDate, id]
  );
}
