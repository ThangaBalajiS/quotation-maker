'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Download, Send } from 'lucide-react';

interface InvoiceItem {
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
  total: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  notes?: string;
  terms?: string;
  quotationId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InvoiceDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string);
    }
  }, [params.id]);

  const fetchInvoice = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`);
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      } else {
        router.push('/dashboard/invoices');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      router.push('/dashboard/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        const response = await fetch(`/api/invoices/${params.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          router.push('/dashboard/invoices');
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading invoice...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Invoice not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Invoice #{invoice.invoiceNumber}
              </h1>
              <p className="text-gray-600">View invoice details</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/invoices/${invoice._id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{invoice.customerName}</h3>
                  {invoice.customerEmail && (
                    <p className="text-gray-600">Email: {invoice.customerEmail}</p>
                  )}
                  {invoice.customerPhone && (
                    <p className="text-gray-600">Phone: {invoice.customerPhone}</p>
                  )}
                  {invoice.customerAddress && (
                    <div className="text-gray-600">
                      <p>{invoice.customerAddress.street}</p>
                      <p>{invoice.customerAddress.city}, {invoice.customerAddress.state} {invoice.customerAddress.pincode}</p>
                      <p>{invoice.customerAddress.country}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>Qty: {item.quantity} {item.unit}</span>
                          <span>Price: ₹{item.price}</span>
                          <span>Tax: {item.taxRate}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{item.total.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes and Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {invoice.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                    </CardContent>
                  </Card>
                )}
                {invoice.terms && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Terms & Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                  {invoice.paidDate && (
                    <div className="flex justify-between">
                      <span>Paid Date:</span>
                      <span>{new Date(invoice.paidDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
                  </div>
                  {invoice.quotationId && (
                    <div className="flex justify-between">
                      <span>From Quotation:</span>
                      <span className="text-blue-600">#{invoice.quotationId}</span>
                    </div>
                  )}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Amount:</span>
                      <span>₹{invoice.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>₹{invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
