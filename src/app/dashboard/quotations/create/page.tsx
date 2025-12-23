'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  gstNumber?: string;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  hsnCode?: string;
  taxRate: number;
  isActive: boolean;
}

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

interface PresetItem {
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
}

export default function CreateQuotationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetId = searchParams.get('presetId');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    validUntil: '',
    notes: '',
    terms: '',
  });

  const [items, setItems] = useState<QuotationItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [includeGst, setIncludeGst] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate item totals when includeGst changes
  useEffect(() => {
    if (items.length > 0) {
      const updatedItems = items.map(item => {
        const baseTotal = item.price * item.quantity;
        return {
          ...item,
          total: includeGst ? baseTotal + (baseTotal * item.taxRate / 100) : baseTotal,
        };
      });
      setItems(updatedItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeGst]);

  const fetchData = async () => {
    try {
      const fetches: Promise<Response>[] = [
        fetch('/api/customers'),
        fetch('/api/products'),
      ];

      // If presetId is provided, also fetch the preset
      if (presetId) {
        fetches.push(fetch(`/api/presets/${presetId}`));
      }

      const responses = await Promise.all(fetches);
      const [customersRes, productsRes, presetRes] = responses;

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.filter((p: Product) => p.isActive));
      }

      // If preset was fetched, populate items
      if (presetRes && presetRes.ok) {
        const presetData = await presetRes.json();
        const presetItems: QuotationItem[] = presetData.items.map((item: PresetItem) => {
          const baseTotal = item.price * item.quantity;
          return {
            productId: item.productId,
            productName: item.productName,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            taxRate: item.taxRate,
            total: includeGst ? baseTotal + (baseTotal * item.taxRate / 100) : baseTotal,
          };
        });
        setItems(presetItems);
        toast.success(`Loaded preset: ${presetData.name}`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


  const addItem = () => {
    if (!selectedProduct || itemQuantity <= 0) return;

    const product = products.find(p => p._id === selectedProduct);
    if (!product) return;

    const baseTotal = product.price * itemQuantity;
    const newItem: QuotationItem = {
      productId: product._id,
      productName: product.name,
      description: product.description,
      quantity: itemQuantity,
      unit: product.unit,
      price: product.price,
      taxRate: product.taxRate,
      total: includeGst ? baseTotal + (baseTotal * product.taxRate / 100) : baseTotal,
    };

    setItems([...items, newItem]);
    setSelectedProduct('');
    setItemQuantity(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...items];
    updatedItems[index].quantity = quantity;
    const baseTotal = updatedItems[index].price * quantity;
    updatedItems[index].total = includeGst
      ? baseTotal + (baseTotal * updatedItems[index].taxRate / 100)
      : baseTotal;
    setItems(updatedItems);
  };

  const updateItemPrice = (index: number, price: number) => {
    const updatedItems = [...items];
    updatedItems[index].price = price;
    const quantity = updatedItems[index].quantity;
    const taxRate = updatedItems[index].taxRate;
    const baseTotal = price * quantity;
    updatedItems[index].total = includeGst ? baseTotal + (baseTotal * taxRate / 100) : baseTotal;
    setItems(updatedItems);
  };

  const updateItemTotal = (index: number, total: number) => {
    const updatedItems = [...items];
    updatedItems[index].total = total;
    const quantity = updatedItems[index].quantity;
    const taxRate = updatedItems[index].taxRate;
    // Calculate price from total
    if (includeGst) {
      // total = price * qty * (1 + taxRate/100)
      // So price = total / (qty * (1 + taxRate/100))
      const price = total / (quantity * (1 + taxRate / 100));
      updatedItems[index].price = Math.round(price * 100) / 100;
    } else {
      // total = price * qty
      updatedItems[index].price = Math.round((total / quantity) * 100) / 100;
    }
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = includeGst
      ? items.reduce((sum, item) => sum + (item.price * item.quantity * item.taxRate / 100), 0)
      : 0;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || items.length === 0) return;

    setSaving(true);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const customer = customers.find(c => c._id === formData.customerId);
        if (!customer) {
          reject('Customer not found');
          return;
        }

        const { subtotal, taxAmount, total } = calculateTotals();

        const quotationData = {
          customerId: formData.customerId,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          customerAddress: customer.address,
          items: items.map(item => ({
            ...item,
            total: includeGst
              ? item.price * item.quantity + (item.price * item.quantity * item.taxRate / 100)
              : item.price * item.quantity,
          })),
          subtotal,
          taxAmount,
          total,
          includeGst,
          validUntil: formData.validUntil,
          notes: formData.notes,
          terms: formData.terms,
        };

        const response = await fetch('/api/quotations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quotationData),
        });

        if (response.ok) {
          resolve('Quotation created successfully');
          router.push('/dashboard/quotations');
        } else {
          reject('Failed to create quotation');
        }
      } catch (error) {
        reject('Error creating quotation');
      } finally {
        setSaving(false);
      }
    });

    toast.promise(promise, {
      loading: 'Creating quotation...',
      success: 'Quotation created successfully',
      error: (err) => `Error: ${err}`,
    });

  };

  const { subtotal, taxAmount, total } = calculateTotals();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Quotation</h1>
            <p className="text-gray-600">Create a new quotation for your customer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
                <CardDescription>Select the customer for this quotation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer *
                    </label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Until *
                    </label>
                    <Input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeGst"
                      checked={includeGst}
                      onChange={(e) => setIncludeGst(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeGst" className="text-sm font-medium text-gray-700">
                      Include GST/Tax in this quotation
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Items */}
            <Card>
              <CardHeader>
                <CardTitle>Add Items</CardTitle>
                <CardDescription>Add products to this quotation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product
                      </label>
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name} - ₹{product.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={addItem}
                    disabled={!selectedProduct || itemQuantity <= 0}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quotation Items</CardTitle>
                <CardDescription>Review and edit the items in this quotation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <div className="flex items-center">
                            <label className="text-sm text-gray-600">Qty:</label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, Number(e.target.value))}
                              className="w-20 ml-2"
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="text-sm text-gray-600">Price/Unit (₹):</label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updateItemPrice(index, Number(e.target.value))}
                              className="w-24 ml-2"
                            />
                          </div>
                          {includeGst && (
                            <div className="text-sm text-gray-600">
                              Tax: {item.taxRate}%
                            </div>
                          )}
                          <div className="flex items-center">
                            <label className="text-sm font-medium">Total (₹):</label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={Math.round(item.total * 100) / 100}
                              onChange={(e) => updateItemTotal(index, Number(e.target.value))}
                              className="w-28 ml-2"
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Totals */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quotation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {includeGst && (
                    <div className="flex justify-between">
                      <span>Tax Amount:</span>
                      <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {!includeGst && (
                    <div className="flex justify-between text-gray-500 text-sm">
                      <span>GST:</span>
                      <span>Not included</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Additional notes for this quotation</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter any additional notes..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
                <CardDescription>Terms and conditions for this quotation</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter terms and conditions..."
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.customerId || items.length === 0 || saving}
            >
              {saving ? 'Creating...' : 'Create Quotation'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

