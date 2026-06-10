import { NextResponse } from 'next/server';
import sql from '@/app/api/utils/sql';

export async function GET(request: Request, { params: _params }: any) {
  const { searchParams } = new URL(request.url);
  const menuId = searchParams.get('id');

  if (!menuId) {
    const menus = await sql`SELECT * FROM menus ORDER BY target_date DESC`;
    return NextResponse.json(menus);
  }

  try {
    // 1. Get menu items (recipes)
    const items = await sql`
      SELECT 
        mi.*, 
        r.name as recipe_name, 
        r.base_yield
      FROM menu_items mi
      JOIN recipes r ON mi.recipe_id = r.id
      WHERE mi.menu_id = ${menuId}
    `;

    // 2. Calculate consolidated shopping list
    // Scale: (Required Portions / Base Yield) * Ingredient Quantity
    const groceryList = await sql`
      SELECT 
        i.id as ingredient_id,
        i.name,
        i.unit,
        i.price_per_unit,
        SUM((mi.portions_required::decimal / r.base_yield::decimal) * ri.quantity) as quantity_required,
        inv.stock_quantity as in_stock,
        (SUM((mi.portions_required::decimal / r.base_yield::decimal) * ri.quantity) - COALESCE(inv.stock_quantity, 0)) as deficit
      FROM menu_items mi
      JOIN recipes r ON mi.recipe_id = r.id
      JOIN recipe_ingredients ri ON r.id = ri.recipe_id
      JOIN ingredients i ON ri.ingredient_id = i.id
      LEFT JOIN inventory inv ON i.id = inv.ingredient_id
      WHERE mi.menu_id = ${menuId}
      GROUP BY i.id, i.name, i.unit, i.price_per_unit, inv.stock_quantity
    `;

    return NextResponse.json({ items, groceryList });
  } catch (error) {
    console.error('Error generating grocery list:', error);
    return NextResponse.json({ error: 'Failed to generate grocery list' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, event_type, target_date, items } = await request.json();

    const [menu] = await sql`
      INSERT INTO menus (name, event_type, target_date)
      VALUES (${name}, ${event_type}, ${target_date})
      RETURNING *
    `;

    if (items && items.length > 0) {
      for (const item of items) {
        await sql`
          INSERT INTO menu_items (menu_id, recipe_id, portions_required)
          VALUES (${menu.id}, ${item.recipe_id}, ${item.portions_required})
        `;
      }
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error creating menu:', error);
    return NextResponse.json({ error: 'Failed to create menu' }, { status: 500 });
  }
}
