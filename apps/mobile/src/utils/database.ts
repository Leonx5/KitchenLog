import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('prepflow.db');

export type Ingredient = {
  id: number;
  name: string;
  category: string | null;
  unit: string | null;
  cost_per_unit: number;
  aliases?: string; // JSON string of aliases
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
  status: string;
  completed_at: string | null;
};

export type IngredientAlias = {
  id: number;
  ingredient_id: number;
  alias: string;
};

export type MenuTemplate = {
  id: number;
  name: string;
  description: string | null;
};

export type MenuTemplateRecipe = {
  template_id: number;
  recipe_id: number;
  servings: number;
};

type CountRow = {
  count: number;
};

export function initializeDatabase() {
  db.execSync('PRAGMA foreign_keys = ON;');
  
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
      ingredient_id INTEGER UNIQUE,
      quantity REAL DEFAULT 0,
      minimum_quantity REAL DEFAULT 0,
      FOREIGN KEY(ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ingredient_id INTEGER,
      menu_id INTEGER,
      quantity REAL,
      transaction_type TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
      FOREIGN KEY(menu_id) REFERENCES menus(id) ON DELETE CASCADE
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
      quantity REAL,
      FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY(ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      event_date TEXT,
      status TEXT DEFAULT 'Draft',
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS menu_recipes (
      menu_id INTEGER,
      recipe_id INTEGER,
      servings INTEGER DEFAULT 1,
      FOREIGN KEY(menu_id) REFERENCES menus(id) ON DELETE CASCADE,
      FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ingredient_aliases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ingredient_id INTEGER,
      alias TEXT NOT NULL,
      FOREIGN KEY(ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS menu_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS menu_template_recipes (
      template_id INTEGER,
      recipe_id INTEGER,
      servings INTEGER DEFAULT 1,
      FOREIGN KEY(template_id) REFERENCES menu_templates(id) ON DELETE CASCADE,
      FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      PRIMARY KEY (template_id, recipe_id)
    );

    CREATE INDEX IF NOT EXISTS idx_alias_ingredient_id ON ingredient_aliases(ingredient_id);
  `);

  // Migrations for existing tables
  try {
    db.execSync(`ALTER TABLE menus ADD COLUMN status TEXT DEFAULT 'Draft';`);
  } catch (e) { /* column might already exist */ }
  try {
    db.execSync(`ALTER TABLE menus ADD COLUMN completed_at TEXT;`);
  } catch (e) { /* column might already exist */ }
}

export function getIngredients() {
  return db.getAllSync<Ingredient>(`
    SELECT 
      i.*,
      (
        SELECT json_group_array(json_object('id', id, 'alias', alias))
        FROM ingredient_aliases
        WHERE ingredient_id = i.id
      ) as aliases
    FROM ingredients i
    ORDER BY i.name
  `);
}

export function addIngredient(
  name: string,
  category: string,
  unit: string,
  costPerUnit: number
) {
  console.log('addIngredient before runSync', { name, category, unit, costPerUnit });
  try {
    const result = db.runSync(
      `INSERT INTO ingredients
        (name, category, unit, cost_per_unit)
       VALUES (?, ?, ?, ?)`,
      [name, category, unit, costPerUnit]
    );
    console.log('addIngredient after runSync success', result);
    return result;
  } catch (e) {
    console.error('addIngredient runSync error', e);
    throw e;
  }
}

export function seedIngredients() {
  const existing = db.getFirstSync<CountRow>(`
    SELECT COUNT(*) as count FROM ingredients
  `);
  console.log('[SEED_DEBUG] ingredient count before seed:', existing?.count ?? 0);

  if ((existing?.count ?? 0) >= 25) {
    console.log('[SEED_DEBUG] already have 25+ ingredients, skipping seed');
    return;
  }

  const demoIngredients: { name: string; category: string; unit: string; cost: number }[] = [
    { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', cost: 150 },
    { name: 'Onions', category: 'Vegetables', unit: 'kg', cost: 120 },
    { name: 'Garlic', category: 'Vegetables', unit: 'kg', cost: 300 },
    { name: 'Ginger', category: 'Vegetables', unit: 'kg', cost: 250 },
    { name: 'Carrots', category: 'Vegetables', unit: 'kg', cost: 100 },
    { name: 'Potatoes', category: 'Vegetables', unit: 'kg', cost: 80 },
    { name: 'Green Peppers', category: 'Vegetables', unit: 'kg', cost: 200 },
    { name: 'Red Peppers', category: 'Vegetables', unit: 'kg', cost: 220 },
    { name: 'Broccoli', category: 'Vegetables', unit: 'kg', cost: 350 },
    { name: 'Spinach', category: 'Vegetables', unit: 'kg', cost: 180 },
    { name: 'Chicken Breast', category: 'Protein', unit: 'kg', cost: 800 },
    { name: 'Chicken Thigh', category: 'Protein', unit: 'kg', cost: 650 },
    { name: 'Beef Mince', category: 'Protein', unit: 'kg', cost: 900 },
    { name: 'Beef Steak', category: 'Protein', unit: 'kg', cost: 1500 },
    { name: 'Pork Sausage', category: 'Protein', unit: 'kg', cost: 600 },
    { name: 'Tilapia', category: 'Protein', unit: 'kg', cost: 700 },
    { name: 'Salmon', category: 'Protein', unit: 'kg', cost: 1200 },
    { name: 'Eggs', category: 'Protein', unit: 'pieces', cost: 50 },
    { name: 'Milk', category: 'Dairy', unit: 'litres', cost: 130 },
    { name: 'Butter', category: 'Dairy', unit: 'kg', cost: 400 },
    { name: 'Cooking Cream', category: 'Dairy', unit: 'litres', cost: 350 },
    { name: 'Basmati Rice', category: 'Grain', unit: 'kg', cost: 250 },
    { name: 'Pasta', category: 'Grain', unit: 'kg', cost: 200 },
    { name: 'Coconut Milk', category: 'Pantry', unit: 'litres', cost: 180 },
    { name: 'Vegetable Oil', category: 'Pantry', unit: 'litres', cost: 300 },
  ];

  let insertedCount = 0;

  for (const ingredient of demoIngredients) {
    const existingRow = db.getFirstSync<{ id: number }>(
      `SELECT id FROM ingredients WHERE name = ?`,
      [ingredient.name]
    );

    if (existingRow) {
      console.log('[SEED_DEBUG] ingredient already exists, skipping:', ingredient.name);
      continue;
    }

    console.log('[SEED_DEBUG] inserting ingredient:', ingredient.name);
    addIngredient(ingredient.name, ingredient.category, ingredient.unit, ingredient.cost);
    insertedCount++;
  }

  const after = db.getFirstSync<CountRow>(`SELECT COUNT(*) as count FROM ingredients`);
  console.log('[SEED_DEBUG] ingredient count after seed:', after?.count ?? 0);
  console.log('[SEED_DEBUG] seed ingredients inserted:', insertedCount);
}

export function seedRecipes() {
  const existing = db.getFirstSync<CountRow>(`
    SELECT COUNT(*) as count FROM recipes
  `);
  console.log('[SEED_DEBUG] recipe count before seed:', existing?.count ?? 0);

  if ((existing?.count ?? 0) >= 15) {
    console.log('[SEED_DEBUG] already have 15+ recipes, skipping seed');
    return;
  }

  const demoRecipes: { name: string; category: string; portions: number }[] = [
    { name: 'Chicken Stir Fry', category: 'Main', portions: 4 },
    { name: 'Beef Stew', category: 'Main', portions: 6 },
    { name: 'Vegetable Curry', category: 'Main', portions: 4 },
    { name: 'Pilau Rice', category: 'Side', portions: 6 },
    { name: 'Coconut Rice', category: 'Side', portions: 6 },
    { name: 'Chicken Alfredo', category: 'Main', portions: 4 },
    { name: 'Spaghetti Bolognese', category: 'Main', portions: 6 },
    { name: 'Grilled Tilapia', category: 'Main', portions: 2 },
    { name: 'Beef Burger', category: 'Main', portions: 4 },
    { name: 'Chicken Wrap', category: 'Main', portions: 2 },
    { name: 'Vegetable Soup', category: 'Soup', portions: 6 },
    { name: 'Mashed Potatoes', category: 'Side', portions: 4 },
    { name: 'Chicken Curry', category: 'Main', portions: 4 },
    { name: 'Rice and Beans', category: 'Main', portions: 6 },
    { name: 'Breakfast Omelette', category: 'Breakfast', portions: 2 },
  ];

  let insertedCount = 0;

  for (const recipe of demoRecipes) {
    const existingRow = db.getFirstSync<{ id: number }>(
      `SELECT id FROM recipes WHERE name = ?`,
      [recipe.name]
    );

    if (existingRow) {
      console.log('[SEED_DEBUG] recipe already exists, skipping:', recipe.name);
      continue;
    }

    console.log('[SEED_DEBUG] inserting recipe:', recipe.name);
    addRecipe(recipe.name, recipe.category, recipe.portions);
    insertedCount++;
  }

  const after = db.getFirstSync<CountRow>(`SELECT COUNT(*) as count FROM recipes`);
  console.log('[SEED_DEBUG] recipe count after seed:', after?.count ?? 0);
  console.log('[SEED_DEBUG] seed recipes inserted:', insertedCount);
}

export function seedInventory() {
  const existing = db.getFirstSync<CountRow>(`
    SELECT COUNT(*) as count FROM inventory
  `);
  console.log('[SEED_DEBUG] inventory count before seed:', existing?.count ?? 0);

  if ((existing?.count ?? 0) >= 20) {
    console.log('[SEED_DEBUG] already have 20+ inventory items, skipping seed');
    return;
  }

  const getOrCreateIngredient = (name: string, category: string, unit: string, cost: number): number => {
    const row = db.getFirstSync<{ id: number }>(`SELECT id FROM ingredients WHERE name = ?`, [name]);
    if (row) return row.id;
    const result = addIngredient(name, category, unit, cost);
    return result.lastInsertRowId;
  };

  const seedItems = [
    // LOW stock (quantity < minimum)
    { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', cost: 150, quantity: 1, minimumQuantity: 5 },
    { name: 'Onions', category: 'Vegetables', unit: 'kg', cost: 120, quantity: 2, minimumQuantity: 10 },
    { name: 'Milk', category: 'Dairy', unit: 'litres', cost: 130, quantity: 3, minimumQuantity: 10 },
    { name: 'Garlic', category: 'Vegetables', unit: 'kg', cost: 300, quantity: 1, minimumQuantity: 3 },
    { name: 'Carrots', category: 'Vegetables', unit: 'kg', cost: 100, quantity: 8, minimumQuantity: 10 },
    { name: 'Green Peppers', category: 'Vegetables', unit: 'kg', cost: 200, quantity: 2, minimumQuantity: 5 },
    { name: 'Spinach', category: 'Vegetables', unit: 'kg', cost: 180, quantity: 2, minimumQuantity: 5 },
    { name: 'Beef Mince', category: 'Protein', unit: 'kg', cost: 900, quantity: 5, minimumQuantity: 10 },
    { name: 'Tilapia', category: 'Protein', unit: 'kg', cost: 700, quantity: 3, minimumQuantity: 5 },
    // CRITICAL stock (quantity <= 20% of minimum)
    { name: 'Ginger', category: 'Vegetables', unit: 'kg', cost: 250, quantity: 0.2, minimumQuantity: 2 },
    { name: 'Red Peppers', category: 'Vegetables', unit: 'kg', cost: 220, quantity: 0.5, minimumQuantity: 4 },
    { name: 'Beef Steak', category: 'Protein', unit: 'kg', cost: 1500, quantity: 0.5, minimumQuantity: 3 },
    { name: 'Salmon', category: 'Protein', unit: 'kg', cost: 1200, quantity: 0.5, minimumQuantity: 4 },
    // HEALTHY stock (quantity >= minimum)
    { name: 'Basmati Rice', category: 'Grain', unit: 'kg', cost: 250, quantity: 50, minimumQuantity: 10 },
    { name: 'Eggs', category: 'Protein', unit: 'pieces', cost: 50, quantity: 30, minimumQuantity: 12 },
    { name: 'Chicken Breast', category: 'Protein', unit: 'kg', cost: 800, quantity: 20, minimumQuantity: 5 },
    { name: 'Potatoes', category: 'Vegetables', unit: 'kg', cost: 80, quantity: 25, minimumQuantity: 15 },
    { name: 'Chicken Thigh', category: 'Protein', unit: 'kg', cost: 650, quantity: 10, minimumQuantity: 8 },
    { name: 'Pork Sausage', category: 'Protein', unit: 'kg', cost: 600, quantity: 8, minimumQuantity: 6 },
    { name: 'Broccoli', category: 'Vegetables', unit: 'kg', cost: 350, quantity: 3, minimumQuantity: 3 },
  ];

  let insertedCount = 0;

  for (const item of seedItems) {
    const existingRow = db.getFirstSync<{ id: number }>(
      `SELECT inv.id FROM inventory inv
       JOIN ingredients i ON i.id = inv.ingredient_id
       WHERE i.name = ?`,
      [item.name]
    );

    if (existingRow) {
      console.log('[SEED_DEBUG] already in inventory, skipping:', item.name);
      continue;
    }

    console.log('[SEED_DEBUG] inserting into inventory:', item.name);
    const ingredientId = getOrCreateIngredient(item.name, item.category, item.unit, item.cost);
    addInventoryItem(ingredientId, item.quantity, item.minimumQuantity);
    insertedCount++;
  }

  const after = db.getFirstSync<CountRow>(`SELECT COUNT(*) as count FROM inventory`);
  console.log('[SEED_DEBUG] inventory row count after seed:', after?.count ?? 0);
  console.log('[SEED_DEBUG] seed items inserted:', insertedCount);
}

export function seedMenus() {
  const existing = db.getFirstSync<CountRow>(`
    SELECT COUNT(*) as count FROM menus
  `);
  console.log('[SEED_DEBUG] menu count before seed:', existing?.count ?? 0);

  if ((existing?.count ?? 0) >= 10) {
    console.log('[SEED_DEBUG] already have 10+ menus, skipping seed');
    return;
  }

  const demoMenus: { name: string; event_date: string }[] = [
    { name: 'Healthy Lunch Menu', event_date: '2026-07-01' },
    { name: 'Corporate Buffet A', event_date: '2026-07-05' },
    { name: 'Corporate Buffet B', event_date: '2026-07-10' },
    { name: 'Wedding Package Silver', event_date: '2026-08-15' },
    { name: 'Wedding Package Gold', event_date: '2026-09-01' },
    { name: 'School Lunch Weekday', event_date: '2026-07-02' },
    { name: 'Gym Meal Plan', event_date: '2026-07-03' },
    { name: 'Vegetarian Package', event_date: '2026-07-20' },
    { name: 'Family Dinner Package', event_date: '2026-07-25' },
    { name: 'Weekend BBQ Package', event_date: '2026-08-01' },
  ];

  let insertedCount = 0;

  for (const menu of demoMenus) {
    const existingRow = db.getFirstSync<{ id: number }>(
      `SELECT id FROM menus WHERE name = ?`,
      [menu.name]
    );

    if (existingRow) {
      console.log('[SEED_DEBUG] menu already exists, skipping:', menu.name);
      continue;
    }

    console.log('[SEED_DEBUG] inserting menu:', menu.name);
    addMenu(menu.name, menu.event_date);
    insertedCount++;
  }

  const after = db.getFirstSync<CountRow>(`SELECT COUNT(*) as count FROM menus`);
  console.log('[SEED_DEBUG] menu count after seed:', after?.count ?? 0);
  console.log('[SEED_DEBUG] seed menus inserted:', insertedCount);
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
  console.log('addRecipe before runSync', { name, category, portions });
  try {
    const result = db.runSync(
      `INSERT INTO recipes
        (name, category, portions)
       VALUES (?, ?, ?)`,
      [name, category, portions]
    );
    console.log('addRecipe after runSync success', result);
  } catch (e) {
    console.error('addRecipe runSync error', e);
    throw e;
  }
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

export function getRecipe(id: number) {
  return db.getFirstSync<Recipe>(
    `SELECT * FROM recipes WHERE id = ?`,
    [id]
  );
}

export function getRecipeIngredients(recipeId: number) {
  return db.getAllSync<{
    ingredient_id: number;
    name: string;
    quantity: number;
    unit: string | null;
  }>(
    `SELECT ri.ingredient_id, i.name, ri.quantity, i.unit
     FROM recipe_ingredients ri
     JOIN ingredients i ON i.id = ri.ingredient_id
     WHERE ri.recipe_id = ?`,
    [recipeId]
  );
}

export function addIngredientToRecipe(recipeId: number, ingredientId: number, quantity: number) {
  db.runSync(
    `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
     VALUES (?, ?, ?)`,
    [recipeId, ingredientId, quantity]
  );
}

export function removeIngredientFromRecipe(recipeId: number, ingredientId: number) {
  db.runSync(
    `DELETE FROM recipe_ingredients
     WHERE recipe_id = ? AND ingredient_id = ?`,
    [recipeId, ingredientId]
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

export function getInventoryHistory() {
  return db.getAllSync<{
    id: number;
    ingredient_name: string;
    menu_name: string | null;
    quantity: number;
    transaction_type: string;
    created_at: string;
    unit: string | null;
  }>(
    `SELECT 
      it.id,
      i.name as ingredient_name,
      m.name as menu_name,
      it.quantity,
      it.transaction_type,
      it.created_at,
      i.unit
     FROM inventory_transactions it
     JOIN ingredients i ON i.id = it.ingredient_id
     LEFT JOIN menus m ON m.id = it.menu_id
     ORDER BY it.created_at DESC`
  );
}

export function addInventoryItem(
  ingredientId: number,
  quantity: number,
  minimumQuantity: number
) {
  console.log('addInventoryItem before runSync', { ingredientId, quantity, minimumQuantity });
  try {
    const result = db.runSync(
      `INSERT INTO inventory
        (ingredient_id, quantity, minimum_quantity)
       VALUES (?, ?, ?)`,
      [ingredientId, quantity, minimumQuantity]
    );
    console.log('addInventoryItem after runSync success', result);
  } catch (e) {
    console.error('addInventoryItem runSync error', e);
    throw e;
  }
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
  console.log('addMenu before runSync', { name, eventDate });
  try {
    const result = db.runSync(
      `INSERT INTO menus (name, event_date)
       VALUES (?, ?)`,
      [name, eventDate]
    );
    console.log('addMenu after runSync success', result);
  } catch (e) {
    console.error('addMenu runSync error', e);
    throw e;
  }
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

export function getMenu(id: number) {
  return db.getFirstSync<Menu>(
    `SELECT * FROM menus WHERE id = ?`,
    [id]
  );
}

export function getMenuRecipes(menuId: number) {
  return db.getAllSync<{
    recipe_id: number;
    name: string;
    servings: number;
  }>(
    `SELECT mr.recipe_id, r.name, mr.servings
     FROM menu_recipes mr
     JOIN recipes r ON r.id = mr.recipe_id
     WHERE mr.menu_id = ?`,
    [menuId]
  );
}

export function addRecipeToMenu(menuId: number, recipeId: number, servings: number) {
  db.runSync(
    `INSERT INTO menu_recipes (menu_id, recipe_id, servings)
     VALUES (?, ?, ?)`,
    [menuId, recipeId, servings]
  );
}

export function removeRecipeFromMenu(menuId: number, recipeId: number) {
  db.runSync(
    `DELETE FROM menu_recipes
     WHERE menu_id = ? AND recipe_id = ?`,
    [menuId, recipeId]
  );
}

export function getMenuShoppingList(menuId: number) {
  return db.getAllSync<{
    ingredient_id: number;
    name: string;
    unit: string | null;
    total_quantity: number;
  }>(
    `SELECT 
      i.id as ingredient_id,
      i.name,
      i.unit,
      SUM((mr.servings * 1.0 / r.portions) * ri.quantity) as total_quantity
     FROM menu_recipes mr
     JOIN recipes r ON r.id = mr.recipe_id
     JOIN recipe_ingredients ri ON ri.recipe_id = r.id
     JOIN ingredients i ON i.id = ri.ingredient_id
     WHERE mr.menu_id = ?
     GROUP BY i.id
     ORDER BY i.name ASC`,
    [menuId]
  );
}

export function getDashboardActiveMenuCount() {
  const result = db.getFirstSync<CountRow>(
    `SELECT COUNT(*) as count FROM menus WHERE status IN ('Active', 'Production')`
  );
  return result?.count ?? 0;
}

export function getInventoryHealthStats() {
  const total = db.getFirstSync<CountRow>(
    `SELECT COUNT(*) as count FROM inventory`
  );
  const healthy = db.getFirstSync<CountRow>(
    `SELECT COUNT(*) as count FROM inventory WHERE quantity >= minimum_quantity`
  );

  const totalCount = total?.count ?? 0;
  const healthyCount = healthy?.count ?? 0;
  
  if (totalCount === 0) return { percent: 100, low: 0, total: 0 };
  
  return {
    percent: Math.round((healthyCount / totalCount) * 100),
    low: totalCount - healthyCount,
    total: totalCount
  };
}

export function getLowStockItems(limit: number = 50) {
  return db.getAllSync<{ name: string; status: string; type: 'critical' | 'restock' }>(
    `SELECT 
      i.name,
      CASE 
        WHEN inv.quantity <= (inv.minimum_quantity * 0.2) THEN 'LOW STOCK'
        ELSE 'RESTOCK SOON'
      END as status,
      CASE 
        WHEN inv.quantity <= (inv.minimum_quantity * 0.2) THEN 'critical'
        ELSE 'restock'
      END as type
     FROM inventory inv
     JOIN ingredients i ON i.id = inv.ingredient_id
     WHERE inv.quantity < inv.minimum_quantity
     LIMIT ?`,
    [limit]
  );
}

export function getInventoryAlertCounts() {
  const total = db.getFirstSync<CountRow>(
    `SELECT COUNT(*) as count FROM inventory WHERE quantity < minimum_quantity`
  );
  const critical = db.getFirstSync<CountRow>(
    `SELECT COUNT(*) as count FROM inventory WHERE quantity < minimum_quantity AND quantity <= (minimum_quantity * 0.2)`
  );
  const restock = db.getFirstSync<CountRow>(
    `SELECT COUNT(*) as count FROM inventory WHERE quantity < minimum_quantity AND quantity > (minimum_quantity * 0.2)`
  );

  return {
    total: total?.count ?? 0,
    critical: critical?.count ?? 0,
    restock: restock?.count ?? 0,
  };
}

export function getInventoryAlerts() {
  return db.getAllSync<{
    id: number;
    name: string;
    quantity: number;
    minimum_quantity: number;
    unit: string | null;
    status: string;
    type: 'critical' | 'restock';
  }>(
    `SELECT 
      inv.id,
      i.name,
      inv.quantity,
      inv.minimum_quantity,
      i.unit,
      CASE 
        WHEN inv.quantity <= (inv.minimum_quantity * 0.2) THEN 'LOW STOCK'
        ELSE 'RESTOCK SOON'
      END as status,
      CASE 
        WHEN inv.quantity <= (inv.minimum_quantity * 0.2) THEN 'critical'
        ELSE 'restock'
      END as type
     FROM inventory inv
     JOIN ingredients i ON i.id = inv.ingredient_id
     WHERE inv.quantity < inv.minimum_quantity
     ORDER BY 
       CASE WHEN inv.quantity <= (inv.minimum_quantity * 0.2) THEN 0 ELSE 1 END,
       inv.quantity ASC`
  );
}

export function setMenuStatus(menuId: number, status: string) {
  const currentMenu = getMenu(menuId);
  if (!currentMenu) return;

  const prevStatus = currentMenu.status;
  
  db.withTransactionSync(() => {
    // 1. Update status
    const completedAt = status === 'Completed' ? new Date().toISOString() : null;
    db.runSync(
      `UPDATE menus SET status = ?, completed_at = ? WHERE id = ?`,
      [status, completedAt, menuId]
    );

    // 2. Handle inventory impact
    // Only consume if moving TO Completed from something else
    if (status === 'Completed' && prevStatus !== 'Completed') {
      consumeInventoryForMenu(menuId);
    } 
    // Only rollback if moving FROM Completed to something else
    else if (status !== 'Completed' && prevStatus === 'Completed') {
      rollbackInventoryForMenu(menuId);
    }
  });
}

function consumeInventoryForMenu(menuId: number) {
  // Robust check: calculate NET consumption for this menu
  // (Total CONSUMPTION - Total ROLLBACK)
  // If net is < 0, ingredients are already deducted.
  const netConsumed = db.getFirstSync<{ net: number }>(
    `SELECT COALESCE(SUM(quantity), 0) as net FROM inventory_transactions 
     WHERE menu_id = ? AND transaction_type IN ('CONSUMPTION', 'ROLLBACK')`,
    [menuId]
  );

  if (netConsumed && netConsumed.net < 0) {
    console.log(`Menu ${menuId} already has active consumption records. Skipping.`);
    return;
  }

  const items = getMenuShoppingList(menuId);
  
  for (const item of items) {
    if (item.total_quantity <= 0) continue;

    // Record transaction (Negative for deduction)
    db.runSync(
      `INSERT INTO inventory_transactions (ingredient_id, menu_id, quantity, transaction_type)
       VALUES (?, ?, ?, 'CONSUMPTION')`,
      [item.ingredient_id, menuId, -item.total_quantity]
    );

    // Update snapshot
    db.runSync(
      `UPDATE inventory SET quantity = quantity - ? WHERE ingredient_id = ?`,
      [item.total_quantity, item.ingredient_id]
    );
  }
}

function rollbackInventoryForMenu(menuId: number) {
  // Robust check: Only rollback if there is something active to rollback
  // Find all individual consumption entries that haven't been offset yet
  // For simplicity in this logic, we query all entries and calculate the inverse of the NET.
  
  const activeTransactions = db.getAllSync<{ ingredient_id: number, net_qty: number }>(
    `SELECT ingredient_id, SUM(quantity) as net_qty 
     FROM inventory_transactions 
     WHERE menu_id = ? AND transaction_type IN ('CONSUMPTION', 'ROLLBACK')
     GROUP BY ingredient_id
     HAVING net_qty < 0`,
    [menuId]
  );

  for (const tx of activeTransactions) {
    const rollbackQty = Math.abs(tx.net_qty);

    // Record rollback transaction (Positive for restoration)
    db.runSync(
      `INSERT INTO inventory_transactions (ingredient_id, menu_id, quantity, transaction_type)
       VALUES (?, ?, ?, 'ROLLBACK')`,
      [tx.ingredient_id, menuId, rollbackQty]
    );

    // Update snapshot
    db.runSync(
      `UPDATE inventory SET quantity = quantity + ? WHERE ingredient_id = ?`,
      [rollbackQty, tx.ingredient_id]
    );
  }
}

// --- Phase 1: Knowledge Platform Extensions ---

// Ingredient Aliases
export function getIngredientAliases(ingredientId: number) {
  return db.getAllSync<IngredientAlias>(
    `SELECT * FROM ingredient_aliases WHERE ingredient_id = ?`,
    [ingredientId]
  );
}

export function addIngredientAlias(ingredientId: number, alias: string) {
  db.runSync(
    `INSERT INTO ingredient_aliases (ingredient_id, alias) VALUES (?, ?)`,
    [ingredientId, alias]
  );
}

export function deleteIngredientAlias(id: number) {
  db.runSync(`DELETE FROM ingredient_aliases WHERE id = ?`, [id]);
}

// Menu Templates
export function getMenuTemplates() {
  return db.getAllSync<MenuTemplate>(`SELECT * FROM menu_templates ORDER BY name`);
}

export function addMenuTemplate(name: string, description: string | null) {
  return db.runSync(
    `INSERT INTO menu_templates (name, description) VALUES (?, ?)`,
    [name, description]
  );
}

export function deleteMenuTemplate(id: number) {
  db.runSync(`DELETE FROM menu_templates WHERE id = ?`, [id]);
}

// Menu Template Recipes
export function getMenuTemplateRecipes(templateId: number) {
  return db.getAllSync<{
    recipe_id: number;
    name: string;
    servings: number;
  }>(
    `SELECT mtr.recipe_id, r.name, mtr.servings
     FROM menu_template_recipes mtr
     JOIN recipes r ON r.id = mtr.recipe_id
     WHERE mtr.template_id = ?`,
    [templateId]
  );
}

export function addRecipeToMenuTemplate(templateId: number, recipeId: number, servings: number) {
  db.runSync(
    `INSERT INTO menu_template_recipes (template_id, recipe_id, servings)
     VALUES (?, ?, ?)`,
    [templateId, recipeId, servings]
  );
}

export function removeRecipeFromMenuTemplate(templateId: number, recipeId: number) {
  db.runSync(
    `DELETE FROM menu_template_recipes
     WHERE template_id = ? AND recipe_id = ?`,
    [templateId, recipeId]
  );
}

export function createMenuFromTemplate(templateId: number, menuName: string, eventDate: string) {
  db.withTransactionSync(() => {
    const result = db.runSync(
      `INSERT INTO menus (name, event_date) VALUES (?, ?)`,
      [menuName, eventDate]
    );
    const menuId = result.lastInsertRowId;

    const templateRecipes = getMenuTemplateRecipes(templateId);
    for (const tr of templateRecipes) {
      addRecipeToMenu(menuId, tr.recipe_id, tr.servings);
    }
  });
}

export function saveMenuAsTemplate(menuId: number, templateName: string, description: string | null) {
  db.withTransactionSync(() => {
    const result = addMenuTemplate(templateName, description);
    const templateId = result.lastInsertRowId;

    const menuRecipes = getMenuRecipes(menuId);
    for (const mr of menuRecipes) {
      addRecipeToMenuTemplate(templateId, mr.recipe_id, mr.servings);
    }
  });
}
