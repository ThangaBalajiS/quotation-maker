import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, Settings, Users, Package, FileText, Receipt, BookmarkCheck } from 'lucide-react';

export interface DashboardStats {
  customers: { count: number; change: number };
  products: { count: number; change: number };
  quotations: { count: number; change: number };
  invoices: { count: number; change: number };
  presets: { count: number };
  hasSettings: boolean;
}

interface OnboardingChecklistProps {
  stats: DashboardStats;
}

export default function OnboardingChecklist({ stats }: OnboardingChecklistProps) {
  const tasks = [
    {
      id: 'settings',
      title: 'Configure your account',
      description: 'Set up your business profile, signature, and logo',
      icon: Settings,
      href: '/dashboard/settings',
      completed: stats.hasSettings,
    },
    {
      id: 'customer',
      title: 'Add customer',
      description: 'Add your first customer to start invoicing',
      icon: Users,
      href: '/dashboard/customers',
      completed: stats.customers.count > 0,
    },
    {
      id: 'product',
      title: 'Add product',
      description: 'Add items or services you sell',
      icon: Package,
      href: '/dashboard/products',
      completed: stats.products.count > 0,
    },
    {
      id: 'quotation',
      title: 'Create quotation',
      description: 'Generate your first price quote',
      icon: FileText,
      href: '/dashboard/quotations/create',
      completed: stats.quotations.count > 0,
    },
    {
      id: 'invoice',
      title: 'Create invoice',
      description: 'Create and send an invoice',
      icon: Receipt,
      href: '/dashboard/invoices/create',
      completed: stats.invoices.count > 0,
    },
    {
      id: 'preset',
      title: 'Create a preset',
      description: 'Save standard items as a preset for quick quotations',
      icon: BookmarkCheck,
      href: '/dashboard/quotations',
      completed: stats.presets.count > 0,
    },
  ];

  const completedTasks = tasks.filter((t) => t.completed).length;
  const progress = Math.round((completedTasks / tasks.length) * 100);

  if (progress === 100) return null;

  return (
    <Card className="border-blue-200 bg-blue-50/50" id="onboarding-checklist">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-blue-900">Welcome! Let&apos;s get you set up</CardTitle>
        <div className="mt-2">
          <div className="flex justify-between text-sm text-blue-800 mb-1">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <Link 
              href={task.href} 
              key={task.id} 
              className={`p-3 rounded-lg border flex items-start space-x-3 transition-colors ${
                task.completed 
                  ? 'bg-blue-50/50 border-blue-100 opacity-70 cursor-default pointer-events-none' 
                  : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <div className="mt-0.5">
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-blue-300" />
                )}
              </div>
              <div>
                <div className={`font-medium flex items-center space-x-2 ${task.completed ? 'text-gray-500 line-through' : 'text-blue-900'}`}>
                  <task.icon className="h-4 w-4" />
                  <span>{task.title}</span>
                </div>
                <div className={`text-xs mt-1 ${task.completed ? 'text-gray-400' : 'text-blue-700/80'}`}>
                  {task.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
