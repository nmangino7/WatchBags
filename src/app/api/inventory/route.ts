import { NextRequest, NextResponse } from 'next/server';
import { getSeedData } from '@/lib/db/seed';
import type { Condition, InventoryItem } from '@/types';

// In-memory store initialized from seed data
let inventoryItems: InventoryItem[] | null = null;

function getInventory(): InventoryItem[] {
  if (inventoryItems === null) {
    inventoryItems = [...getSeedData().inventoryItems];
  }
  return inventoryItems;
}

export async function GET() {
  try {
    const inventory = getInventory();
    const seed = getSeedData();

    // Enrich inventory items with model and brand details
    const enriched = inventory.map((item) => {
      const model = seed.models.find((m) => m.id === item.modelId);
      const brand = model
        ? seed.brands.find((b) => b.id === model.brandId)
        : undefined;

      return {
        ...item,
        model: model
          ? { id: model.id, name: model.name, referenceNumber: model.referenceNumber }
          : null,
        brand: brand ? { id: brand.id, name: brand.name } : null,
      };
    });

    return NextResponse.json({ inventory: enriched });
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      modelId,
      purchasePrice,
      purchaseDate,
      condition,
      platform,
      notes,
    } = body as {
      modelId?: string;
      purchasePrice?: number;
      purchaseDate?: string;
      condition?: string;
      platform?: string;
      notes?: string;
    };

    // Validate required fields
    if (!modelId || purchasePrice === undefined || !condition) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: modelId, purchasePrice, condition',
        },
        { status: 400 }
      );
    }

    if (typeof purchasePrice !== 'number' || purchasePrice <= 0) {
      return NextResponse.json(
        { error: 'purchasePrice must be a positive number' },
        { status: 400 }
      );
    }

    const validConditions: Condition[] = ['mint', 'excellent', 'good', 'fair'];
    if (!validConditions.includes(condition as Condition)) {
      return NextResponse.json(
        { error: `condition must be one of: ${validConditions.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify model exists
    const seed = getSeedData();
    const model = seed.models.find((m) => m.id === modelId);
    if (!model) {
      return NextResponse.json(
        { error: `Model with id "${modelId}" not found` },
        { status: 404 }
      );
    }

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      modelId,
      purchasePrice,
      purchaseDate: purchaseDate
        ? new Date(purchaseDate)
        : new Date(),
      condition: condition as Condition,
      status: 'in_hand',
      salePrice: undefined,
      saleDate: undefined,
      platform: platform ?? undefined,
      notes: notes ?? undefined,
    };

    const inventory = getInventory();
    inventory.push(newItem);

    const brand = seed.brands.find((b) => b.id === model.brandId);

    return NextResponse.json(
      {
        item: {
          ...newItem,
          model: {
            id: model.id,
            name: model.name,
            referenceNumber: model.referenceNumber,
          },
          brand: brand ? { id: brand.id, name: brand.name } : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Inventory POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error adding inventory item' },
      { status: 500 }
    );
  }
}
