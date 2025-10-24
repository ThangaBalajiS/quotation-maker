'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, FileText, Receipt, TrendingUp, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { data: session } = useSession();

  const stats = [
    {
      name: 'Total Customers',
      value: '0',
      icon: Users,
      change: '+0%',
      changeType: 'positive',
    },
    {
      name: 'Total Products',
      value: '0',
      icon: Package,
      change: '+0%',
      changeType: 'positive',
    },
    {
      name: 'Total Quotations',
      value: '0',
      icon: FileText,
      change: '+0%',
      changeType: 'positive',
    },
    {
      name: 'Total Invoices',
      value: '0',
      icon: Receipt,
      change: '+0%',
      changeType: 'positive',
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
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {stats.map((stat) => (
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
                  <span className="text-green-600">{stat.change}</span> from last month
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
