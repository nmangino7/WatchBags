import { NextRequest, NextResponse } from 'next/server';
import {
  getInventoryItems,
  insertInventoryItem,
  updateInventoryItem,
  getInventoryItemById,
  getAllModels,
  getAllBrands,
} from '@/lib/db/queries';
import type { Condition, InventoryItem } from '@/types';

export async function GET() {
  try {
    const [items, models, brands] = await Promise.all([
      getInventoryItems(),
      getAllModels(),
      getAllBrands(),
    ]);

    const enriched = items.map((item) => {
      const model = models.find((m) => m.id === item.modelId);
      const brand = model ? brands.find((b) => b.id === model.brandId) : undefined;
      return {
        ...item,
        model: model ? { id: model.id, name: model.name, referenceNumber: model.referenceNumber } : null,
        brand: brand ? { id: brand.id, name: brand.name } : null,
      };
    });

    return NextResponse.json({ inventory: enriched });
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json({ error: 'Internal server error fetching inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, purchasePrice, purchaseDate, condition, platform, notes } = body as {
      modelId?: string;
      purchasePrice?: number;
      purchaseDate?: string;
      condition?: string;
      platform?: string;
      notes?: string;
    };

    if (!modelId || purchasePrice === undefined || !condition) {
      return NextResponse.json(
        { error: 'Missing required fields: modelId, purchasePrice, condition' },
        { status: 400 }
      );
    }

    if (typeof purchasePrice !== 'number' || purchasePrice <= 0) {
      return NextResponse.json({ error: 'purchasePrice must be a positive number' }, { status: 400 });
    }

    const validConditions: Condition[] = ['mint', 'excellent', 'good', 'fair'];
    if (!validConditions.includes(condition as Condition)) {
      return NextResponse.json(
        { error: `condition must be one of: ${validConditions.join(', ')}` },
        { status: 400 }
      );
    }

    const models = await getAllModels();
    const model = models.find((m) => m.id === modelId);
    if (!model) {
      return NextResponse.json({ error: `Model with id "${modelId}" not found` }, { status: 404 });
    }

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      modelId,
      purchasePrice,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      condition: condition as Condition,
      status: 'in_hand',
      salePrice: undefined,
      saleDate: undefined,
      platform: platform ?? undefined,
      notes: notes ?? undefined,
    };

    await insertInventoryItem(newItem);

    const brands = await getAllBrands();
    const brand = brands.find((b) => b.id === model.brandId);

    return NextResponse.json(
      {
        item: {
          ...newItem,
          model: { id: model.id, name: model.name, referenceNumber: model.referenceNumber },
          brand: brand ? { id: brand.id, name: brand.name } : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Inventory POST error:', error);
    return NextResponse.json({ error: 'Internal server error adding inventory item' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, salePrice, saleDate, platform, notes } = body as {
      id?: string;
      status?: string;
      salePrice?: number;
      saleDate?: string;
      platform?: string;
      notes?: string;
    };

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    const item = await getInventoryItemById(id);
    if (!item) {
      return NextResponse.json({ error: `Inventory item with id "${id}" not found` }, { status: 404 });
    }

    const validStatuses = ['in_hand', 'listed', 'sold'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (salePrice !== undefined) updates.salePrice = salePrice;
    if (saleDate) updates.saleDate = new Date(saleDate);
    if (platform !== undefined) updates.platform = platform;
    if (notes !== undefined) updates.notes = notes;

    await updateInventoryItem(id, updates);

    const updated = await getInventoryItemById(id);
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error('Inventory PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error updating inventory item' }, { status: 500 });
  }
}
