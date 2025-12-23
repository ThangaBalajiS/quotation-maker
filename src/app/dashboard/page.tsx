'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Package, FileText, Receipt } from 'lucide-react';

interface DashboardStats {
  customers: { count: number; change: number };
  products: { count: number; change: number };
  quotations: { count: number; change: number };
  invoices: { count: number; change: number };
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Total Customers',
      value: loading ? <Skeleton className="h-8 w-[60px]" /> : stats?.customers.count.toString() ?? '0',
      icon: Users,
      change: stats?.customers.change ?? 0,
    },
    {
      name: 'Total Products',
      value: loading ? <Skeleton className="h-8 w-[60px]" /> : stats?.products.count.toString() ?? '0',
      icon: Package,
      change: stats?.products.change ?? 0,
    },
    {
      name: 'Total Quotations',
      value: loading ? <Skeleton className="h-8 w-[60px]" /> : stats?.quotations.count.toString() ?? '0',
      icon: FileText,
      change: stats?.quotations.change ?? 0,
    },
    {
      name: 'Total Invoices',
      value: loading ? <Skeleton className="h-8 w-[60px]" /> : stats?.invoices.count.toString() ?? '0',
      icon: Receipt,
      change: stats?.invoices.change ?? 0,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'quotation',
      description: 'New quotation created',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'customer',
      description: 'New customer added',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'invoice',
      description: 'Invoice sent to customer',
      time: '1 day ago',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-gray-600 text-sm lg:text-base">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.change >= 0 ? "text-green-600" : "text-red-600"}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activities</CardTitle>
              <CardDescription>
                Your latest business activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Common tasks you might want to perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/customers" className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-xs font-medium text-center">Add Customer</span>
                </Link>
                <Link href="/dashboard/products" className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Package className="h-6 w-6 text-green-500 mb-1" />
                  <span className="text-xs font-medium text-center">Add Product</span>
                </Link>
                <Link href="/dashboard/quotations/create" className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="h-6 w-6 text-purple-500 mb-1" />
                  <span className="text-xs font-medium text-center">Create Quotation</span>
                </Link>
                <Link href="/dashboard/invoices/create" className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Receipt className="h-6 w-6 text-orange-500 mb-1" />
                  <span className="text-xs font-medium text-center">Create Invoice</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
