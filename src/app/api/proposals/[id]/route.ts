import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Proposal from '@/models/Proposal';

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

    const proposal = await Proposal.findOne({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
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
    const {
      clientName,
      projectLocation,
      plantCapacity,
      projectType,
      roofType,
      pricePerKW,
      gstRate = 8.9,
      advancePercent = 70,
      balancePercent = 30,
      paymentTermsNotes,
      materials,
      roi,
      technicalSummary,
      financialSummary,
      terms,
      validUntil,
      status,
      date,
    } = body;

    if (!clientName || !projectLocation || !plantCapacity || !pricePerKW || !validUntil) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    await connectDB();

    // Calculate amounts
    const amount = plantCapacity * pricePerKW;
    const gstAmount = amount * (gstRate / 100);
    const totalAmount = amount + gstAmount;

    const proposal = await Proposal.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      {
        clientName,
        projectLocation,
        plantCapacity,
        projectType: projectType || 'On-Grid Solar',
        roofType: roofType || 'Sheeted Roof',
        pricePerKW,
        amount,
        gstRate,
        gstAmount,
        totalAmount,
        advancePercent,
        balancePercent,
        paymentTermsNotes,
        materials,
        roi,
        technicalSummary,
        financialSummary,
        terms,
        validUntil: new Date(validUntil),
        date: date ? new Date(date) : undefined,
        status: status || 'draft',
      },
      { new: true }
    );

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error('Error updating proposal:', error);
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

    const proposal = await Proposal.findOneAndDelete({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
