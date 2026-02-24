import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import Customer from '@/models/Customer';
import BrandImage from '@/models/BrandImage';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '@/components/pdf/InvoicePDF';

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

    // Fetch invoice
    const invoice = await Invoice.findOne({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
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

    // Helper function to safely format address (handles both string and legacy object formats)
    const formatAddress = (address: unknown): string | undefined => {
      if (!address) return undefined;
      if (typeof address === 'string') return address;
      if (typeof address === 'object' && address !== null) {
        const addr = address as { street?: string; city?: string; state?: string; pincode?: string; country?: string };
        const parts = [addr.street, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : undefined;
      }
      return undefined;
    };

    // Fetch customer GST number
    const customer = await Customer.findById(invoice.customerId).select('gstNumber').lean() as { gstNumber?: string } | null;

    // Fetch brand images for PDF
    const brandImages = await BrandImage.find({ tenantId: session.user.tenantId })
      .sort({ order: 1 })
      .select('imageUrl')
      .lean() as unknown as { imageUrl: string }[];

    // Prepare data for PDF
    const pdfData = {
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.createdAt,
      dueDate: invoice.dueDate,
      customerName: invoice.customerName,
      customerAddress: formatAddress(invoice.customerAddress),
      customerGstNumber: customer?.gstNumber,
      items: invoice.items,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      notes: invoice.notes,
      terms: invoice.terms,
      brandImages: brandImages.map((img) => img.imageUrl),
      businessDetails: {
        businessName: user.businessDetails?.businessName || 'Your Business Name',
        contactPerson: user.name,
        address: formatAddress(user.businessDetails?.address) || '',
        phone: user.businessDetails?.phone,
        email: user.businessDetails?.email || user.email,
        gstNumber: user.businessDetails?.gstNumber,
        logo: user.businessDetails?.logo,
        signature: user.businessDetails?.signature,
        bankDetails: user.businessDetails?.bankDetails,
      },
    };

    // Generate PDF
    const pdfDoc = pdf(<InvoicePDF data={pdfData} />);
    const pdfStream = await pdfDoc.toBlob();

    // Return PDF as response
    return new NextResponse(pdfStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
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
