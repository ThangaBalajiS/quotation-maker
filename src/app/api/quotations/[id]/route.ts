import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Quotation from '@/models/Quotation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { customerId, customerName, customerEmail, customerPhone, customerAddress, items, notes, terms, validUntil, status } = body;

    if (!customerId || !customerName || !items || !validUntil) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    await connectDB();

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const taxAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity * item.taxRate / 100), 0);
    const total = subtotal + taxAmount;

    const quotation = await Quotation.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      {
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: items.map((item: any) => ({
          ...item,
          total: item.price * item.quantity + (item.price * item.quantity * item.taxRate / 100),
        })),
        subtotal,
        taxAmount,
        total,
        validUntil: new Date(validUntil),
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
    const session = await getServerSession(authOptions);
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
