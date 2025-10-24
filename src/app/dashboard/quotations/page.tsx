'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Eye, Edit, Trash2, Download, Copy } from 'lucide-react';

interface Quotation {
  _id: string;
  quotationNumber: string;
  customerName: string;
  total: number;
  status: 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  createdAt: string;
}

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await fetch('/api/quotations');
      if (response.ok) {
        const data = await response.json();
        setQuotations(data);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      try {
        const response = await fetch(`/api/quotations/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchQuotations();
        }
      } catch (error) {
        console.error('Error deleting quotation:', error);
      }
    }
  };

  const handleView = (id: string) => {
    router.push(`/dashboard/quotations/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/quotations/${id}/edit`);
  };

  const handleDownloadPDF = async (id: string, quotationNumber: string) => {
    try {
      const response = await fetch(`/api/quotations/${id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quotation-${quotationNumber}.pdf`;
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

  const handleDuplicate = async (id: string) => {
    if (confirm('Are you sure you want to duplicate this quotation?')) {
      try {
        const response = await fetch(`/api/quotations/${id}/duplicate`, {
          method: 'POST',
        });
        if (response.ok) {
          fetchQuotations();
        } else {
          console.error('Error duplicating quotation');
        }
      } catch (error) {
        console.error('Error duplicating quotation:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
          <div className="text-lg">Loading quotations...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quotations</h1>
            <p className="text-gray-600 text-sm lg:text-base">Manage your quotations and quotes</p>
          </div>
          <Button onClick={() => router.push('/dashboard/quotations/create')} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Quotation
          </Button>
        </div>

        {/* Quotations List */}
        <div className="grid grid-cols-1 gap-4 lg:gap-6">
          {quotations.map((quotation) => (
            <Card key={quotation._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center text-base lg:text-lg">
                      <FileText className="h-4 w-4 lg:h-5 lg:w-5 mr-2 flex-shrink-0" />
                      <span className="truncate">{quotation.quotationNumber}</span>
                    </CardTitle>
                    <CardDescription className="text-sm truncate">
                      Customer: {quotation.customerName}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                      {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                    </span>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleView(quotation._id)}
                        title="View quotation"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(quotation._id)}
                        title="Edit quotation"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadPDF(quotation._id, quotation.quotationNumber)}
                        title="Download PDF"
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDuplicate(quotation._id)}
                        title="Duplicate quotation"
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(quotation._id)}
                        title="Delete quotation"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs lg:text-sm text-gray-600">
                  <div>
                    <p className="font-medium">Total: ₹{quotation.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p>Valid Until: {new Date(quotation.validUntil).toLocaleDateString()}</p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <p>Created: {new Date(quotation.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {quotations.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No quotations found</p>
            <p className="text-sm text-gray-400">Create your first quotation to get started</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
