import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Quotation from '@/models/Quotation';
import User from '@/models/User';
import { pdf } from '@react-pdf/renderer';
import QuotationPDF from '@/components/pdf/QuotationPDF';

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

    // Fetch quotation
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

    // Fetch user business details
    const user = await User.findOne({ tenantId: session.user.tenantId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare data for PDF
    const pdfData = {
      quotationNumber: quotation.quotationNumber,
      date: quotation.createdAt,
      customerName: quotation.customerName,
      customerAddress: quotation.customerAddress ? 
        `${quotation.customerAddress.street}, ${quotation.customerAddress.city}, ${quotation.customerAddress.state} ${quotation.customerAddress.pincode}` : 
        undefined,
      workDescription: 'Professional Services', // You can customize this
      items: quotation.items,
      subtotal: quotation.subtotal,
      taxAmount: quotation.taxAmount,
      total: quotation.total,
      notes: quotation.notes,
      terms: quotation.terms,
      businessDetails: {
        businessName: user.businessDetails?.businessName || 'Your Business Name',
        contactPerson: user.name,
        address: user.businessDetails?.address || {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
        },
        phone: user.businessDetails?.phone,
        email: user.businessDetails?.email || user.email,
        gstNumber: user.businessDetails?.gstNumber,
        logo: user.businessDetails?.logo,
        signature: user.businessDetails?.signature,
      },
    };

    // Generate PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfDoc = pdf(QuotationPDF({ data: pdfData }) as any);
    const pdfStream = await pdfDoc.toBlob();

    // Return PDF as response
    return new NextResponse(pdfStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation-${quotation.quotationNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
