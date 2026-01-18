import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Proposal from '@/models/Proposal';

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const proposals = await Proposal.find({ tenantId: session.user.tenantId })
      .sort({ createdAt: -1 });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
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
    const {
      quotationId,
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
      materials = [],
      roi,
      technicalSummary,
      financialSummary,
      terms = [],
      validUntil,
    } = body;

    if (!clientName || !projectLocation || !plantCapacity || !pricePerKW || !validUntil) {
      return NextResponse.json(
        { error: 'Required fields missing: clientName, projectLocation, plantCapacity, pricePerKW, validUntil' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate proposal number
    const count = await Proposal.countDocuments({ tenantId: session.user.tenantId });
    const proposalNumber = `PROP-${String(count + 1).padStart(4, '0')}`;

    // Calculate amounts
    const amount = plantCapacity * pricePerKW;
    const gstAmount = amount * (gstRate / 100);
    const totalAmount = amount + gstAmount;

    // Default ROI calculations if not provided
    const defaultRoi = {
      energyGenerationPerYear: Math.round(plantCapacity * 1600), // ~1600 kWh/kW/year
      co2SavingsPerYear: Math.round(plantCapacity * 1.3 * 10) / 10, // ~1.3 tonnes/kW/year
      paybackPeriodMin: 2.5,
      paybackPeriodMax: 3.5,
      totalSavings25Years: Math.round(plantCapacity * 1600 * 8 * 22), // 22 years at ~Rs 8/kWh
      treesEquivalent: Math.round(plantCapacity * 62), // ~62 trees equivalent per kW
      co2EliminatedTotal: Math.round(plantCapacity * 1.3 * 22), // 22 years of CO2 savings
    };

    const proposal = new Proposal({
      tenantId: session.user.tenantId,
      quotationId,
      proposalNumber,
      date: new Date(),
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
      roi: roi || defaultRoi,
      technicalSummary,
      financialSummary,
      terms,
      validUntil: new Date(validUntil),
    });

    await proposal.save();

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
