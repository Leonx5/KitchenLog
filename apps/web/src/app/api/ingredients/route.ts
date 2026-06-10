import { NextResponse } from 'next/server';
import sql from '@/app/api/utils/sql';

export async function GET() {
  try {
    const ingredients = await sql`SELECT * FROM ingredients ORDER BY name ASC`;
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json({ error: 'Failed to fetch ingredients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, unit, price_per_unit, yield_percentage, category } = await request.json();

    const [ingredient] = await sql`
      INSERT INTO ingredients (name, unit, price_per_unit, yield_percentage, category)
      VALUES (${name}, ${unit}, ${price_per_unit}, ${yield_percentage}, ${category})
      RETURNING *
    `;

    // Also create inventory entry
    await sql`
      INSERT INTO inventory (ingredient_id, stock_quantity)
      VALUES (${ingredient.id}, 0)
    `;

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json({ error: 'Failed to create ingredient' }, { status: 500 });
  }
}
