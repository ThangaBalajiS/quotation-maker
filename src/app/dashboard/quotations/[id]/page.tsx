'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Download, Send } from 'lucide-react';

interface QuotationItem {
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
  total: number;
}

interface Quotation {
  _id: string;
  quotationNumber: string;
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
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuotationDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchQuotation(params.id as string);
    }
  }, [params.id]);

  const fetchQuotation = async (id: string) => {
    try {
      const response = await fetch(`/api/quotations/${id}`);
      if (response.ok) {
        const data = await response.json();
        setQuotation(data);
      } else {
        router.push('/dashboard/quotations');
      }
    } catch (error) {
      console.error('Error fetching quotation:', error);
      router.push('/dashboard/quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      try {
        const response = await fetch(`/api/quotations/${params.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          router.push('/dashboard/quotations');
        }
      } catch (error) {
        console.error('Error deleting quotation:', error);
      }
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/quotations/${params.id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quotation-${quotation?.quotationNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Error downloading PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading quotation...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!quotation) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Quotation not found</div>
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
                Quotation #{quotation.quotationNumber}
              </h1>
              <p className="text-gray-600">View quotation details</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/quotations/${quotation._id}/edit`)}
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
            <Button onClick={handleDownloadPDF}>
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
          {/* Quotation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{quotation.customerName}</h3>
                  {quotation.customerEmail && (
                    <p className="text-gray-600">Email: {quotation.customerEmail}</p>
                  )}
                  {quotation.customerPhone && (
                    <p className="text-gray-600">Phone: {quotation.customerPhone}</p>
                  )}
                  {quotation.customerAddress && (
                    <div className="text-gray-600">
                      <p>{quotation.customerAddress.street}</p>
                      <p>{quotation.customerAddress.city}, {quotation.customerAddress.state} {quotation.customerAddress.pincode}</p>
                      <p>{quotation.customerAddress.country}</p>
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
                  {quotation.items.map((item, index) => (
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
            {(quotation.notes || quotation.terms) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quotation.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 whitespace-pre-wrap">{quotation.notes}</p>
                    </CardContent>
                  </Card>
                )}
                {quotation.terms && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Terms & Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 whitespace-pre-wrap">{quotation.terms}</p>
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
                <CardTitle>Quotation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                      {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Until:</span>
                    <span>{new Date(quotation.validUntil).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(quotation.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{quotation.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Amount:</span>
                      <span>₹{quotation.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>₹{quotation.total.toFixed(2)}</span>
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
