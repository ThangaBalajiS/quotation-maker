'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  unit: string;
  taxRate: number;
  hsnCode?: string;
}

interface QuotationItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

interface Quotation {
  _id: string;
  quotationNumber: string;
  customer: Customer;
  customerName: string;
  quotationDate: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: string;
  notes?: string;
  terms?: string;
}

interface FormItem {
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
  total: number;
  product?: Product;
}

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    validUntil: '',
    notes: '',
    terms: '',
  });
  const [items, setItems] = useState<QuotationItem[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchQuotation();
      fetchCustomers();
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  useEffect(() => {
    console.log('Items updated:', items);
  }, [items]);

  // Update items with product data when both quotation and products are loaded
  useEffect(() => {
    if (quotation && products.length > 0 && items.length > 0) {
      console.log('Both quotation and products loaded, updating items with product data');
      const updatedItems = items.map(item => {
        if (item.product?._id && item.product._id !== '') {
          const product = products.find(p => p._id === item.product._id);
          if (product) {
            return {
              ...item,
              product: product,
              unitPrice: product.price,
              taxRate: product.taxRate,
              total: item.quantity * product.price
            };
          }
        }
        return item;
      });
      
      // Only update if there are actual changes
      const hasChanges = updatedItems.some((item, index) => {
        const original = items[index];
        return item.unitPrice !== original.unitPrice || 
               item.taxRate !== original.taxRate ||
               item.product._id !== original.product._id;
      });
      
      if (hasChanges) {
        console.log('Updating items with product data');
        setItems(updatedItems);
      }
    }
  }, [quotation, products]); // Depend on quotation and products, not items


  const formatDateForInput = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', dateString);
        return '';
      }
      const formatted = date.toISOString().split('T')[0];
      console.log('Formatted date:', dateString, '->', formatted);
      return formatted;
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString);
      return '';
    }
  };

  const fetchQuotation = useCallback(async () => {
    try {
      const response = await fetch(`/api/quotations/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Quotation data loaded:', data);
        console.log('Valid until raw:', data.validUntil);
        setQuotation(data);
        
        const formattedValidUntil = formatDateForInput(data.validUntil);
        
        console.log('Formatted valid until:', formattedValidUntil);
        
        setFormData({
          customerId: data.customerId || data.customer?._id || '',
          validUntil: formattedValidUntil,
          notes: data.notes || '',
          terms: data.terms || '',
        });
        // Ensure items have proper product data structure
        const itemsWithProducts = (data.items || []).map((item: FormItem) => {
          // If item has productId but no product object, create a placeholder
          if (item.productId && !item.product) {
            return {
              ...item,
              product: { 
                _id: item.productId, 
                name: item.productName || '', 
                price: item.price || 0, 
                unit: item.unit || '', 
                taxRate: item.taxRate || 0 
              }
            };
          }
          return {
            ...item,
            product: item.product || { _id: '', name: '', price: 0, unit: '', taxRate: 0 }
          };
        });
        setItems(itemsWithProducts);
      }
    } catch (error) {
      console.error('Error fetching quotation:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        console.log('Customers loaded:', data);
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        console.log('Products loaded:', data);
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddItem = () => {
    if (products.length > 0) {
      const newItem: QuotationItem = {
        product: products[0],
        quantity: 1,
        unitPrice: products[0].price,
        taxRate: products[0].taxRate,
        total: products[0].price,
      };
      setItems([...items, newItem]);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number | Product) => {
    console.log('handleItemChange called:', { index, field, value, products: products.length });
    const newItems = [...items];
    const oldItem = { ...newItems[index] };
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'product') {
      const product = products.find(p => p._id === value);
      console.log('Product found:', product);
      if (product) {
        newItems[index].unitPrice = product.price;
        newItems[index].taxRate = product.taxRate;
        newItems[index].product = product;
        console.log('Updated item:', newItems[index]);
      } else {
        // If no product selected, reset to default values
        newItems[index].unitPrice = 0;
        newItems[index].taxRate = 0;
        newItems[index].product = { _id: '', name: '', price: 0, unit: '', taxRate: 0 };
      }
    }
    
    // Recalculate total (base amount without tax)
    const newTotal = (newItems[index].quantity || 0) * (newItems[index].unitPrice || 0);
    newItems[index].total = newTotal;
    
    console.log('Item change summary:', {
      field,
      oldValue: oldItem[field],
      newValue: value,
      oldTotal: oldItem.total,
      newTotal: newTotal,
      quantity: newItems[index].quantity,
      unitPrice: newItems[index].unitPrice
    });
    
    setItems(newItems);
  };

  const calculateTotals = () => {
    // Calculate base amount (before tax) for each item
    const subtotal = items.reduce((sum, item) => {
      const baseAmount = (item.quantity || 0) * (item.unitPrice || 0);
      return sum + baseAmount;
    }, 0);
    
    // Calculate tax amount for each item based on base amount
    const taxAmount = items.reduce((sum, item) => {
      const baseAmount = (item.quantity || 0) * (item.unitPrice || 0);
      return sum + (baseAmount * (item.taxRate || 0) / 100);
    }, 0);
    
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotation) return;

    setSaving(true);
    try {
      const { subtotal, taxAmount, total } = calculateTotals();
      const selectedCustomer = customers.find(c => c._id === formData.customerId);
      
      const quotationData = {
        customerId: formData.customerId,
        customerName: selectedCustomer?.name || '',
        quotationDate: quotation?.quotationDate || new Date(),
        validUntil: formData.validUntil,
        items: items.map(item => ({
          productId: item.product._id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.unitPrice,
          taxRate: item.taxRate,
          total: item.total,
        })),
        subtotal,
        taxAmount,
        total,
        notes: formData.notes,
        terms: formData.terms,
      };

      const response = await fetch(`/api/quotations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData),
      });

      if (response.ok) {
        router.push('/dashboard/quotations');
      } else {
        console.error('Error updating quotation');
      }
    } catch (error) {
      console.error('Error updating quotation:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!quotation) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Quotation not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Edit Quotation</h1>
            <p className="text-gray-600 text-sm lg:text-base">#{quotation.quotationNumber}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quotation Details</CardTitle>
              <CardDescription>Update quotation information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <option value="">Select Customer</option>
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
                    value={formData.validUntil || ''}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Add products to this quotation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No items added yet. Click &quot;Add Item&quot; to start.</p>
                  </div>
                )}
                {items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product
                        </label>
                        <select
                          value={item.product?._id || ''}
                          onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Product</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.name} - ₹{product.price}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Qty
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            console.log('Quantity changing from', item.quantity, 'to', newQuantity);
                            handleItemChange(index, 'quantity', newQuantity);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice || 0}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tax Rate (%)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.taxRate || 0}
                          onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm">
                          <p className="font-medium">Base: ₹{(item.total || 0).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Tax: ₹{((item.total || 0) * (item.taxRate || 0) / 100).toFixed(2)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddItem}
                  className="w-full"
                >
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || items.length === 0}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Update Quotation'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
