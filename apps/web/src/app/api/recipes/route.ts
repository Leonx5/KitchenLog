import { NextResponse } from 'next/server';
import sql from '@/app/api/utils/sql';

export async function GET() {
  try {
    // Get recipes with their calculated total cost
    const recipes = await sql`
      SELECT 
        r.*,
        COALESCE(SUM(ri.quantity * i.price_per_unit), 0) as total_cost,
        COALESCE(SUM(ri.quantity * i.price_per_unit) / NULLIF(r.base_yield, 0), 0) as cost_per_portion
      FROM recipes r
      LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
      LEFT JOIN ingredients i ON ri.ingredient_id = i.id
      GROUP BY r.id
      ORDER BY r.name ASC
    `;
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, category, base_yield, portion_size, notes, ingredients } = await request.json();

    const [recipe] = await sql`
      INSERT INTO recipes (name, category, base_yield, portion_size, notes)
      VALUES (${name}, ${category}, ${base_yield}, ${portion_size}, ${notes})
      RETURNING *
    `;

    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        await sql`
          INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
          VALUES (${recipe.id}, ${ing.ingredient_id}, ${ing.quantity})
        `;
      }
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
  }
}
