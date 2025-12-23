'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Download, Send, BookmarkCheck, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

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
  includeGst?: boolean;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [savingPreset, setSavingPreset] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchQuotation(params.id as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchQuotation = useCallback(async (id: string) => {
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
  }, [router]);

  const handleDelete = async () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/quotations/${params.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          resolve('Quotation deleted successfully');
          router.push('/dashboard/quotations');
        } else {
          reject('Failed to delete quotation');
        }
      } catch (error) {
        reject('Error deleting quotation');
      } finally {
        setShowDeleteDialog(false);
      }
    });

    toast.promise(promise, {
      loading: 'Deleting quotation...',
      success: 'Quotation deleted successfully',
      error: 'Error deleting quotation',
    });
  };

  const handleSaveAsPreset = async () => {
    if (!quotation || !presetName.trim()) return;

    setSavingPreset(true);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const presetItems = quotation.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          taxRate: item.taxRate,
        }));

        const response = await fetch('/api/presets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: presetName,
            description: presetDescription,
            items: presetItems,
          }),
        });

        if (response.ok) {
          resolve('Preset created successfully');
          setShowPresetDialog(false);
          setPresetName('');
          setPresetDescription('');
        } else {
          reject('Failed to create preset');
        }
      } catch (error) {
        reject('Error creating preset');
      } finally {
        setSavingPreset(false);
      }
    });

    toast.promise(promise, {
      loading: 'Creating preset...',
      success: 'Preset created successfully',
      error: 'Error creating preset',
    });
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

  const handleCreateInvoice = async () => {
    if (!quotation || !invoiceDueDate) return;

    setCreatingInvoice(true);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const invoiceData = {
          customerId: quotation.customerId,
          customerName: quotation.customerName,
          customerEmail: quotation.customerEmail,
          customerPhone: quotation.customerPhone,
          customerAddress: quotation.customerAddress,
          items: quotation.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            taxRate: item.taxRate,
            total: item.total,
          })),
          dueDate: invoiceDueDate,
          notes: quotation.notes,
          terms: quotation.terms,
          quotationId: quotation._id,
          includeGst: quotation.includeGst !== false,
        };

        const response = await fetch('/api/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invoiceData),
        });

        if (response.ok) {
          const invoice = await response.json();
          resolve('Invoice created successfully');
          setShowInvoiceDialog(false);
          setInvoiceDueDate('');
          router.push(`/dashboard/invoices/${invoice._id}`);
        } else {
          reject('Failed to create invoice');
        }
      } catch (error) {
        reject('Error creating invoice');
      } finally {
        setCreatingInvoice(false);
      }
    });

    toast.promise(promise, {
      loading: 'Creating invoice...',
      success: 'Invoice created successfully',
      error: 'Error creating invoice',
    });
  };

  const openInvoiceDialog = () => {
    // Set default due date to 30 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setInvoiceDueDate(defaultDueDate.toISOString().split('T')[0]);
    setShowInvoiceDialog(true);
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
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
            <Button variant="default" onClick={openInvoiceDialog}>
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
            <Button variant="outline" onClick={() => setShowPresetDialog(true)}>
              <BookmarkCheck className="h-4 w-4 mr-2" />
              Save as Preset
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
                    {quotation.includeGst !== false ? (
                      <div className="flex justify-between">
                        <span>Tax Amount:</span>
                        <span>₹{quotation.taxAmount.toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-gray-500 text-sm">
                        <span>GST:</span>
                        <span>Not included</span>
                      </div>
                    )}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this quotation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save as Preset</AlertDialogTitle>
            <AlertDialogDescription>
              Create a preset from this quotation&apos;s items for quick reuse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Preset Name *
              </label>
              <Input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., Monthly Office Supplies"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description (optional)
              </label>
              <textarea
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Optional description..."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveAsPreset}
              disabled={!presetName.trim() || savingPreset}
            >
              {savingPreset ? 'Saving...' : 'Save Preset'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Invoice from Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Create an invoice based on this quotation. The invoice will include all items and customer details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Invoice Due Date *
              </label>
              <Input
                type="date"
                value={invoiceDueDate}
                onChange={(e) => setInvoiceDueDate(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Customer:</strong> {quotation?.customerName}</p>
              <p><strong>Items:</strong> {quotation?.items.length} item(s)</p>
              <p><strong>Total:</strong> ₹{quotation?.total.toFixed(2)}</p>
              {quotation?.includeGst === false && (
                <p className="text-yellow-600">Note: GST is not included in this quotation</p>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateInvoice}
              disabled={!invoiceDueDate || creatingInvoice}
            >
              {creatingInvoice ? 'Creating...' : 'Create Invoice'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout >
  );
}
