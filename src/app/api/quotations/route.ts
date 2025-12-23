import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Quotation, { IQuotationItem } from '@/models/Quotation';

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const quotations = await Quotation.find({ tenantId: session.user.tenantId })
      .sort({ createdAt: -1 });

    return NextResponse.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, customerName, customerEmail, customerPhone, customerAddress, items, notes, terms, validUntil, includeGst = true } = body;

    if (!customerId || !customerName || !items || !validUntil) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate quotation number
    const count = await Quotation.countDocuments({ tenantId: session.user.tenantId });
    const quotationNumber = `QUO-${String(count + 1).padStart(4, '0')}`;

    // Calculate totals (respect includeGst flag)
    const subtotal = items.reduce((sum: number, item: IQuotationItem) => sum + (item.price * item.quantity), 0);
    const taxAmount = includeGst
      ? items.reduce((sum: number, item: IQuotationItem) => sum + (item.price * item.quantity * item.taxRate / 100), 0)
      : 0;
    const total = subtotal + taxAmount;

    const quotation = new Quotation({
      tenantId: session.user.tenantId,
      quotationNumber,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items: items.map((item: IQuotationItem) => ({
        ...item,
        total: includeGst
          ? item.price * item.quantity + (item.price * item.quantity * item.taxRate / 100)
          : item.price * item.quantity,
      })),
      subtotal,
      taxAmount,
      total,
      includeGst,
      validUntil: new Date(validUntil),
      notes,
      terms,
    });

    await quotation.save();

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error('Error creating quotation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
