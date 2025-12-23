'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, FileText } from 'lucide-react';
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
    createdAt: string;
    updatedAt: string;
}

export default function PresetDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [preset, setPreset] = useState<Preset | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchPreset(params.id as string);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const fetchPreset = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/presets/${id}`);
            if (response.ok) {
                const data = await response.json();
                setPreset(data);
            } else {
                router.push('/dashboard/presets');
            }
        } catch (error) {
            console.error('Error fetching preset:', error);
            router.push('/dashboard/presets');
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
                const response = await fetch(`/api/presets/${params.id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    resolve('Preset deleted successfully');
                    router.push('/dashboard/presets');
                } else {
                    reject('Failed to delete preset');
                }
            } catch (error) {
                reject('Error deleting preset');
            } finally {
                setShowDeleteDialog(false);
            }
        });

        toast.promise(promise, {
            loading: 'Deleting preset...',
            success: 'Preset deleted successfully',
            error: 'Error deleting preset',
        });
    };

    const calculateItemTotal = (item: PresetItem) => {
        const subtotal = item.price * item.quantity;
        const tax = subtotal * item.taxRate / 100;
        return subtotal + tax;
    };

    const calculateTotals = () => {
        if (!preset) return { subtotal: 0, taxAmount: 0, total: 0 };

        const subtotal = preset.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxAmount = preset.items.reduce((sum, item) => sum + (item.price * item.quantity * item.taxRate / 100), 0);
        const total = subtotal + taxAmount;
        return { subtotal, taxAmount, total };
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading preset...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (!preset) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Preset not found</div>
                </div>
            </DashboardLayout>
        );
    }

    const { subtotal, taxAmount, total } = calculateTotals();

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
                            <h1 className="text-3xl font-bold text-gray-900">{preset.name}</h1>
                            <p className="text-gray-600">Preset details</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/dashboard/presets/${preset._id}/edit`)}
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
                        <Button onClick={() => router.push(`/dashboard/quotations/create?presetId=${preset._id}`)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Create Quotation
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Preset Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        {preset.description && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 whitespace-pre-wrap">{preset.description}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {preset.items.map((item, index) => (
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
                                                <div className="font-medium">₹{calculateItemTotal(item).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preset Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>Total Items:</span>
                                        <span>{preset.items.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Created:</span>
                                        <span>{new Date(preset.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="border-t pt-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>₹{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tax Amount:</span>
                                            <span>₹{taxAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                                            <span>Est. Total:</span>
                                            <span>₹{total.toFixed(2)}</span>
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
                            This action cannot be undone. This will permanently delete this preset.
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
        </DashboardLayout>
    );
}
