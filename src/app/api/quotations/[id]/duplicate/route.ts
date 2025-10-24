import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Quotation from '@/models/Quotation';

export async function POST(
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

    // Find the original quotation
    const originalQuotation = await Quotation.findOne({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!originalQuotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Get the next quotation number
    const count = await Quotation.countDocuments({ tenantId: session.user.tenantId });
    const quotationNumber = `QUO-${String(count + 1).padStart(4, '0')}`;

    // Create a duplicate quotation
    const duplicatedQuotation = new Quotation({
      tenantId: originalQuotation.tenantId,
      quotationNumber,
      customerId: originalQuotation.customerId,
      customerName: originalQuotation.customerName,
      customerEmail: originalQuotation.customerEmail,
      customerPhone: originalQuotation.customerPhone,
      customerAddress: originalQuotation.customerAddress,
      items: originalQuotation.items.map(item => ({
        ...item.toObject(),
        _id: undefined, // Remove the _id to let MongoDB generate a new one
      })),
      subtotal: originalQuotation.subtotal,
      taxAmount: originalQuotation.taxAmount,
      total: originalQuotation.total,
      status: 'sent', // New quotation starts as 'sent'
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: originalQuotation.notes,
      terms: originalQuotation.terms,
    });

    await duplicatedQuotation.save();

    return NextResponse.json(duplicatedQuotation, { status: 201 });
  } catch (error) {
    console.error('Error duplicating quotation:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate quotation' },
      { status: 500 }
    );
  }
}

