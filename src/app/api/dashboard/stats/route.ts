import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import Quotation from '@/models/Quotation';
import Invoice from '@/models/Invoice';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get counts for the current user's tenant
        const tenantId = session.user.tenantId;

        const [customersCount, productsCount, quotationsCount, invoicesCount] = await Promise.all([
            Customer.countDocuments({ tenantId }),
            Product.countDocuments({ tenantId }),
            Quotation.countDocuments({ tenantId }),
            Invoice.countDocuments({ tenantId }),
        ]);

        // Get counts from last month for comparison
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const [
            customersLastMonth,
            productsLastMonth,
            quotationsLastMonth,
            invoicesLastMonth,
        ] = await Promise.all([
            Customer.countDocuments({ tenantId, createdAt: { $lt: lastMonth } }),
            Product.countDocuments({ tenantId, createdAt: { $lt: lastMonth } }),
            Quotation.countDocuments({ tenantId, createdAt: { $lt: lastMonth } }),
            Invoice.countDocuments({ tenantId, createdAt: { $lt: lastMonth } }),
        ]);

        // Calculate percentage changes
        const calcChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        return NextResponse.json({
            customers: {
                count: customersCount,
                change: calcChange(customersCount, customersLastMonth),
            },
            products: {
                count: productsCount,
                change: calcChange(productsCount, productsLastMonth),
            },
            quotations: {
                count: quotationsCount,
                change: calcChange(quotationsCount, quotationsLastMonth),
            },
            invoices: {
                count: invoicesCount,
                change: calcChange(invoicesCount, invoicesLastMonth),
            },
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
