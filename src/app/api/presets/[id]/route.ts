import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Preset, { IPresetItem } from '@/models/Preset';

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

        const preset = await Preset.findOne({
            _id: id,
            tenantId: session.user.tenantId,
        });

        if (!preset) {
            return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
        }

        return NextResponse.json(preset);
    } catch (error) {
        console.error('Error fetching preset:', error);
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
        const { name, description, items } = body;

        if (!name || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Name and at least one item are required' },
                { status: 400 }
            );
        }

        await connectDB();

        const preset = await Preset.findOneAndUpdate(
            { _id: id, tenantId: session.user.tenantId },
            {
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
            },
            { new: true }
        );

        if (!preset) {
            return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
        }

        return NextResponse.json(preset);
    } catch (error) {
        console.error('Error updating preset:', error);
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

        const preset = await Preset.findOneAndDelete({
            _id: id,
            tenantId: session.user.tenantId,
        });

        if (!preset) {
            return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Preset deleted successfully' });
    } catch (error) {
        console.error('Error deleting preset:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
