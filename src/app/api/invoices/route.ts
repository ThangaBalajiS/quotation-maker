import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const invoices = await Invoice.find({ tenantId: session.user.tenantId })
      .sort({ createdAt: -1 });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, customerName, customerEmail, customerPhone, customerAddress, items, notes, terms, dueDate, quotationId } = body;

    if (!customerId || !customerName || !items || !dueDate) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate invoice number
    const count = await Invoice.countDocuments({ tenantId: session.user.tenantId });
    const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const taxAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity * item.taxRate / 100), 0);
    const total = subtotal + taxAmount;

    const invoice = new Invoice({
      tenantId: session.user.tenantId,
      invoiceNumber,
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
      dueDate: new Date(dueDate),
      notes,
      terms,
      quotationId,
    });

    await invoice.save();

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
