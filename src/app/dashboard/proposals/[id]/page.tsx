'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface Material {
  description: string;
  specification: string;
  warranty: string;
}

interface ROI {
  energyGenerationPerYear: number;
  co2SavingsPerYear: number;
  paybackPeriodMin: number;
  paybackPeriodMax: number;
  totalSavings25Years: number;
  treesEquivalent: number;
  co2EliminatedTotal: number;
}

interface Proposal {
  _id: string;
  proposalNumber: string;
  date: string;
  clientName: string;
  projectLocation: string;
  plantCapacity: number;
  projectType: string;
  roofType: string;
  pricePerKW: number;
  amount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  advancePercent: number;
  balancePercent: number;
  paymentTermsNotes?: string;
  materials: Material[];
  roi: ROI;
  terms: string[];
  validUntil: string;
  status: string;
  createdAt: string;
}

export default function ViewProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    fetchProposal();
  }, [id]);

  const fetchProposal = async () => {
    try {
      const response = await fetch(`/api/proposals/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProposal(data);
      } else {
        toast.error('Proposal not found');
        router.push('/dashboard/proposals');
      }
    } catch (error) {
      console.error('Error fetching proposal:', error);
      toast.error('Error loading proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!proposal) return;
    try {
      const response = await fetch(`/api/proposals/${id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proposal-${proposal.proposalNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error('Error downloading PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error downloading PDF');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading proposal...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!proposal) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Proposal not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{proposal.proposalNumber}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/dashboard/proposals/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={() => router.push(`/dashboard/proposals/${id}/print`)} className="bg-blue-600 hover:bg-blue-700">
              <Printer className="h-4 w-4 mr-2" />
              Print / Save PDF
            </Button>
            <Button variant="secondary" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Client & Project Info */}
        <Card>
          <CardHeader>
            <CardTitle>Client & Project Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Client Name</p>
              <p className="font-medium">{proposal.clientName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{proposal.projectLocation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Plant Capacity</p>
              <p className="font-medium">{proposal.plantCapacity} KW</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Project Type</p>
              <p className="font-medium">{proposal.projectType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Roof Type</p>
              <p className="font-medium">{proposal.roofType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valid Until</p>
              <p className="font-medium">{new Date(proposal.validUntil).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-500">Price Per KW</p>
              <p className="font-medium">₹ {proposal.pricePerKW.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium">₹ {proposal.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">GST ({proposal.gstRate}%)</p>
              <p className="font-medium">₹ {proposal.gstAmount.toLocaleString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-bold text-lg text-green-700">₹ {proposal.totalAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              <li>{proposal.advancePercent}% advance along with Order Confirmation</li>
              <li>{proposal.balancePercent}% After Installation completion</li>
              {proposal.paymentTermsNotes && <li>{proposal.paymentTermsNotes}</li>}
            </ul>
          </CardContent>
        </Card>

        {/* Bill of Materials */}
        <Card>
          <CardHeader>
            <CardTitle>Bill of Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Specification</th>
                    <th className="text-left p-2">Warranty</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.materials.map((material, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{material.description}</td>
                      <td className="p-2">{material.specification}</td>
                      <td className="p-2">{material.warranty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card>
          <CardHeader>
            <CardTitle>Return on Investment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-500">Energy/Year</p>
              <p className="font-bold">{proposal.roi.energyGenerationPerYear.toLocaleString()} kWh</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm text-gray-500">CO₂ Savings/Year</p>
              <p className="font-bold">{proposal.roi.co2SavingsPerYear} tonnes</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <p className="text-sm text-gray-500">Payback Period</p>
              <p className="font-bold">{proposal.roi.paybackPeriodMin} - {proposal.roi.paybackPeriodMax} years</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-sm text-gray-500">22-Year Savings</p>
              <p className="font-bold">₹ {proposal.roi.totalSavings25Years.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {proposal.terms.map((term, index) => (
                <li key={index} className="text-sm whitespace-pre-line">{term}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
