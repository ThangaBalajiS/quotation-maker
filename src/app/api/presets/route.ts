import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Preset, { IPresetItem } from '@/models/Preset';

export async function GET() {
    try {
        const session = (await getServerSession(authOptions)) as Session | null;
        if (!session?.user?.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const presets = await Preset.find({ tenantId: session.user.tenantId })
            .sort({ createdAt: -1 });

        return NextResponse.json(presets);
    } catch (error) {
        console.error('Error fetching presets:', error);
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
        const { name, description, items } = body;

        if (!name || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Name and at least one item are required' },
                { status: 400 }
            );
        }

        await connectDB();

        const preset = new Preset({
            tenantId: session.user.tenantId,
            name,
            description,
            items: items.map((item: IPresetItem) => ({
                productId: item.productId,
                productName: item.productName,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                taxRate: item.taxRate,
            })),
        });

        await preset.save();

        return NextResponse.json(preset, { status: 201 });
    } catch (error) {
        console.error('Error creating preset:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
