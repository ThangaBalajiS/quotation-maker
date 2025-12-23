'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, Pencil, Trash2, FileText } from 'lucide-react';
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

export default function PresetsPage() {
    const router = useRouter();
    const [presets, setPresets] = useState<Preset[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchPresets();
    }, []);

    const fetchPresets = async () => {
        try {
            const response = await fetch('/api/presets');
            if (response.ok) {
                const data = await response.json();
                setPresets(data);
            }
        } catch (error) {
            console.error('Error fetching presets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`/api/presets/${deleteId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    setPresets(presets.filter(p => p._id !== deleteId));
                    resolve('Preset deleted successfully');
                } else {
                    reject('Failed to delete preset');
                }
            } catch (error) {
                reject('Error deleting preset');
            } finally {
                setDeleteId(null);
            }
        });

        toast.promise(promise, {
            loading: 'Deleting preset...',
            success: 'Preset deleted successfully',
            error: 'Error deleting preset',
        });
    };

    const calculateTotal = (items: PresetItem[]) => {
        return items.reduce((sum, item) => {
            const subtotal = item.price * item.quantity;
            const tax = subtotal * item.taxRate / 100;
            return sum + subtotal + tax;
        }, 0);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading presets...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Presets</h1>
                        <p className="text-gray-600">Manage your quotation presets for quick quotation creation</p>
                    </div>
                    <Button onClick={() => router.push('/dashboard/presets/create')}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Preset
                    </Button>
                </div>

                {presets.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-gray-600 mb-4">No presets found. Create your first preset!</p>
                            <Button onClick={() => router.push('/dashboard/presets/create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Preset
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {presets.map((preset) => (
                            <Card key={preset._id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="truncate">{preset.name}</span>
                                        <span className="text-sm font-normal text-gray-500">
                                            {preset.items.length} item{preset.items.length !== 1 ? 's' : ''}
                                        </span>
                                    </CardTitle>
                                    {preset.description && (
                                        <CardDescription className="line-clamp-2">
                                            {preset.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-sm text-gray-600">
                                            <div className="font-medium text-gray-900 mb-2">Products:</div>
                                            <ul className="space-y-1">
                                                {preset.items.slice(0, 3).map((item, index) => (
                                                    <li key={index} className="truncate">
                                                        • {item.productName} × {item.quantity}
                                                    </li>
                                                ))}
                                                {preset.items.length > 3 && (
                                                    <li className="text-gray-400">
                                                        +{preset.items.length - 3} more...
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t">
                                            <span className="text-sm text-gray-600">Est. Total:</span>
                                            <span className="font-semibold">₹{calculateTotal(preset.items).toFixed(2)}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => router.push(`/dashboard/presets/${preset._id}`)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/dashboard/presets/${preset._id}/edit`)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setDeleteId(preset._id)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => router.push(`/dashboard/quotations/create?presetId=${preset._id}`)}
                                            >
                                                <FileText className="h-4 w-4 mr-1" />
                                                Quote
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this preset.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
