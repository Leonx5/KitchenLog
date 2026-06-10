import { NextResponse } from 'next/server';
import sql from '@/app/api/utils/sql';

export async function GET() {
  try {
    const inventory = await sql`
      SELECT 
        inv.*, 
        i.name, 
        i.unit, 
        i.category
      FROM inventory inv
      JOIN ingredients i ON inv.ingredient_id = i.id
      ORDER BY i.name ASC
    `;
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { ingredient_id, quantity_change } = await request.json();

    const [updated] = await sql`
      UPDATE inventory 
      SET stock_quantity = stock_quantity + ${quantity_change},
          updated_at = CURRENT_TIMESTAMP
      WHERE ingredient_id = ${ingredient_id}
      RETURNING *
    `;

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
