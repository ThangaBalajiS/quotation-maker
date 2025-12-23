'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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

interface PresetItem {
    productId: string;
    productName: string;
    description?: string;
    quantity: number;
    unit: string;
    price: number;
    taxRate: number;
}

interface Preset {
    _id: string;
    name: string;
    description?: string;
    items: PresetItem[];
}

export default function EditPresetPage() {
    const router = useRouter();
    const params = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const [items, setItems] = useState<PresetItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [itemQuantity, setItemQuantity] = useState(1);

    useEffect(() => {
        if (params.id) {
            fetchData(params.id as string);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const fetchData = useCallback(async (id: string) => {
        try {
            const [presetRes, productsRes] = await Promise.all([
                fetch(`/api/presets/${id}`),
                fetch('/api/products'),
            ]);

            if (presetRes.ok) {
                const preset: Preset = await presetRes.json();
                setFormData({
                    name: preset.name,
                    description: preset.description || '',
                });
                setItems(preset.items);
            } else {
                router.push('/dashboard/presets');
                return;
            }

            if (productsRes.ok) {
                const productsData = await productsRes.json();
                setProducts(productsData.filter((p: Product) => p.isActive));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            router.push('/dashboard/presets');
        } finally {
            setLoading(false);
        }
    }, [router]);

    const addItem = () => {
        if (!selectedProduct || itemQuantity <= 0) return;

        const product = products.find(p => p._id === selectedProduct);
        if (!product) return;

        const newItem: PresetItem = {
            productId: product._id,
            productName: product.name,
            description: product.description,
            quantity: itemQuantity,
            unit: product.unit,
            price: product.price,
            taxRate: product.taxRate,
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
        setItems(updatedItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => {
            const subtotal = item.price * item.quantity;
            const tax = subtotal * item.taxRate / 100;
            return sum + subtotal + tax;
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || items.length === 0) return;

        setSaving(true);

        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`/api/presets/${params.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        description: formData.description,
                        items,
                    }),
                });

                if (response.ok) {
                    resolve('Preset updated successfully');
                    router.push(`/dashboard/presets/${params.id}`);
                } else {
                    reject('Failed to update preset');
                }
            } catch (error) {
                reject('Error updating preset');
            } finally {
                setSaving(false);
            }
        });

        toast.promise(promise, {
            loading: 'Updating preset...',
            success: 'Preset updated successfully',
            error: (err) => `Error: ${err}`,
        });
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
                        <h1 className="text-3xl font-bold text-gray-900">Edit Preset</h1>
                        <p className="text-gray-600">Update preset details</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Preset Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Preset Details</CardTitle>
                                <CardDescription>Update the preset information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Preset Name *
                                        </label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Monthly Office Supplies"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Optional description for this preset..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Add Products */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Add Products</CardTitle>
                                <CardDescription>Add more products to this preset</CardDescription>
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
                                        Add Product
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Items List */}
                    {items.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Preset Items</CardTitle>
                                <CardDescription>Review and edit the products in this preset</CardDescription>
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
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <div>
                                                        <label className="text-sm text-gray-600">Quantity:</label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItemQuantity(index, Number(e.target.value))}
                                                            className="w-20 ml-2"
                                                        />
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Price: ₹{item.price} per {item.unit}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Tax: {item.taxRate}%
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

                    {/* Summary */}
                    {items.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Preset Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Estimated Total (with tax):</span>
                                    <span className="text-xl font-bold">₹{calculateTotal().toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
                            disabled={!formData.name || items.length === 0 || saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
