import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Quotation, { IQuotationItem } from '@/models/Quotation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const quotation = await Quotation.findOne({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { customerId, customerName, customerEmail, customerPhone, customerAddress, items, notes, terms, validUntil, status, quotationDate, includeGst = true } = body;

    if (!customerId || !customerName || !items || !validUntil) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    await connectDB();

    // Calculate totals (respect includeGst flag)
    const subtotal = items.reduce((sum: number, item: IQuotationItem) => sum + (item.price * item.quantity), 0);
    const taxAmount = includeGst
      ? items.reduce((sum: number, item: IQuotationItem) => sum + (item.price * item.quantity * item.taxRate / 100), 0)
      : 0;
    const total = subtotal + taxAmount;

    const quotation = await Quotation.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      {
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: items.map((item: IQuotationItem) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          taxRate: item.taxRate,
          total: includeGst
            ? item.price * item.quantity + (item.price * item.quantity * item.taxRate / 100)
            : item.price * item.quantity,
        })),
        subtotal,
        taxAmount,
        total,
        includeGst,
        validUntil: new Date(validUntil),
        quotationDate: quotationDate ? new Date(quotationDate) : undefined,
        notes,
        terms,
        status: status || 'sent',
      },
      { new: true }
    );

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const quotation = await Quotation.findOneAndDelete({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
