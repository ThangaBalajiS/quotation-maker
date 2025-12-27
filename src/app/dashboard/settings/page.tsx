'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Building2, Upload, Trash2 } from 'lucide-react';

import { toast } from 'sonner';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    gstNumber: '',
    phone: '',
    email: '',
    address: '',
    logo: '',
    signature: '',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branch: '',
  });

  useEffect(() => {
    fetchBusinessDetails();
  }, []);

  const fetchBusinessDetails = async () => {
    try {
      const response = await fetch('/api/business-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.businessDetails) {
          setFormData({
            businessName: data.businessDetails.businessName || '',
            gstNumber: data.businessDetails.gstNumber || '',
            phone: data.businessDetails.phone || '',
            email: data.businessDetails.email || '',
            address: data.businessDetails.address || '',
            logo: data.businessDetails.logo || '',
            signature: data.businessDetails.signature || '',
            accountName: data.businessDetails.bankDetails?.accountName || '',
            accountNumber: data.businessDetails.bankDetails?.accountNumber || '',
            ifscCode: data.businessDetails.bankDetails?.ifscCode || '',
            bankName: data.businessDetails.bankDetails?.bankName || '',
            branch: data.businessDetails.bankDetails?.branch || '',
          });
        }
      }
    } catch (err) {
      console.error('Error fetching business details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const businessDetails = {
          businessName: formData.businessName,
          gstNumber: formData.gstNumber || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          address: formData.address || undefined,
          logo: formData.logo || undefined,
          signature: formData.signature || undefined,
          bankDetails: {
            accountName: formData.accountName || undefined,
            accountNumber: formData.accountNumber || undefined,
            ifscCode: formData.ifscCode || undefined,
            bankName: formData.bankName || undefined,
            branch: formData.branch || undefined,
          },
        };

        const response = await fetch('/api/business-settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(businessDetails),
        });

        if (response.ok) {
          resolve('Business details updated successfully!');
        } else {
          reject('Error updating business details');
        }
      } catch (err) {
        console.error('Error saving business details:', err);
        reject('Error saving business details');
      } finally {
        setSaving(false);
      }
    });

    toast.promise(promise, {
      loading: 'Saving settings...',
      success: 'Business details updated successfully!',
      error: 'Error updating business details',
    });
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'signature') => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('type', type);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formDataUpload,
        });

        if (response.ok) {
          const data = await response.json();
          setFormData((prev) => ({ ...prev, [type]: data.imageUrl }));
          resolve(`${type} uploaded successfully!`);
        } else {
          reject(`Error uploading ${type}`);
        }
      } catch (err) {
        console.error(`Error uploading ${type}:`, err);
        reject(`Error uploading ${type}`);
      }
    });

    toast.promise(promise, {
      loading: `Uploading ${type}...`,
      success: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`,
      error: `Error uploading ${type}`,
    });
  };

  const handleDeleteImage = async (type: 'logo' | 'signature') => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/upload/image?type=${type}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setFormData((prev) => ({ ...prev, [type]: '' }));
          resolve(`${type} removed successfully!`);
        } else {
          reject(`Error removing ${type}`);
        }
      } catch (err) {
        console.error(`Error deleting ${type}:`, err);
        reject(`Error deleting ${type}`);
      }
    });

    toast.promise(promise, {
      loading: `Removing ${type}...`,
      success: `${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully!`,
      error: `Error removing ${type}`,
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading settings...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
          <p className="text-gray-600">Manage your business information and branding</p>
        </div>



        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Your business name and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number
                  </label>
                  <Input
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Business Address</CardTitle>
              <CardDescription>
                Your business address for invoices and quotations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address
                </label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your complete business address"
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter your complete address as you want it to appear on documents
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Upload your business logo and signature for documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Logo
                </label>
                <div className="flex items-center space-x-4">
                  {formData.logo && (
                    <div className="relative">
                      <Image
                        src={formData.logo}
                        alt="Business Logo"
                        width={80}
                        height={80}
                        className="object-contain border rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => handleDeleteImage('logo')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'logo');
                      }}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {formData.logo ? 'Change Logo' : 'Upload Logo'}
                    </label>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Your logo will appear in the header of all quotations and invoices.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digital Signature
                </label>
                <div className="flex items-center space-x-4">
                  {formData.signature && (
                    <div className="relative">
                      <Image
                        src={formData.signature}
                        alt="Digital Signature"
                        width={128}
                        height={80}
                        className="object-contain border rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => handleDeleteImage('signature')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'signature');
                      }}
                      className="hidden"
                      id="signature-upload"
                    />
                    <label
                      htmlFor="signature-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {formData.signature ? 'Change Signature' : 'Upload Signature'}
                    </label>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Your digital signature will appear at the bottom of all quotations and invoices.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>
                Your banking information for payment instructions on documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <Input
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="Account holder name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <Input
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="Bank account number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code
                  </label>
                  <Input
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    placeholder="IFSC code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <Input
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="Bank name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <Input
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    placeholder="Bank branch"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
