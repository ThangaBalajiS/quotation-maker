'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Eye, Edit, Trash2, Download, Copy } from 'lucide-react';
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

interface Proposal {
  _id: string;
  proposalNumber: string;
  clientName: string;
  projectLocation: string;
  plantCapacity: number;
  projectType: string;
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  createdAt: string;
}

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);
  const [proposalToDuplicate, setProposalToDuplicate] = useState<string | null>(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/proposals');
      if (response.ok) {
        const data = await response.json();
        setProposals(data);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setProposalToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!proposalToDelete) return;

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/proposals/${proposalToDelete}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchProposals();
          resolve('Proposal deleted successfully');
        } else {
          reject('Failed to delete proposal');
        }
      } catch (error) {
        reject('Error deleting proposal');
      } finally {
        setProposalToDelete(null);
      }
    });

    toast.promise(promise, {
      loading: 'Deleting proposal...',
      success: 'Proposal deleted successfully',
      error: 'Error deleting proposal',
    });
  };

  const handleView = (id: string) => {
    router.push(`/dashboard/proposals/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/proposals/${id}/edit`);
  };

  const handleDownloadPDF = async (id: string, proposalNumber: string) => {
    try {
      const response = await fetch(`/api/proposals/${id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proposal-${proposalNumber}.pdf`;
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

  const handleDuplicateClick = (id: string) => {
    setProposalToDuplicate(id);
  };

  const handleConfirmDuplicate = async () => {
    if (!proposalToDuplicate) return;

    const promise = new Promise(async (resolve, reject) => {
      try {
        // First fetch the proposal
        const getResponse = await fetch(`/api/proposals/${proposalToDuplicate}`);
        if (!getResponse.ok) {
          reject('Failed to fetch proposal');
          return;
        }
        const proposal = await getResponse.json();
        
        // Create a new proposal with the same data
        const response = await fetch('/api/proposals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: proposal.clientName,
            projectLocation: proposal.projectLocation,
            plantCapacity: proposal.plantCapacity,
            projectType: proposal.projectType,
            roofType: proposal.roofType,
            pricePerKW: proposal.pricePerKW,
            gstRate: proposal.gstRate,
            advancePercent: proposal.advancePercent,
            balancePercent: proposal.balancePercent,
            paymentTermsNotes: proposal.paymentTermsNotes,
            materials: proposal.materials,
            roi: proposal.roi,
            technicalSummary: proposal.technicalSummary,
            financialSummary: proposal.financialSummary,
            terms: proposal.terms,
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          }),
        });
        
        if (response.ok) {
          fetchProposals();
          resolve('Proposal duplicated successfully');
        } else {
          reject('Failed to duplicate proposal');
        }
      } catch (error) {
        reject('Error duplicating proposal');
      } finally {
        setProposalToDuplicate(null);
      }
    });

    toast.promise(promise, {
      loading: 'Duplicating proposal...',
      success: 'Proposal duplicated successfully',
      error: 'Error duplicating proposal',
    });
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
          <div className="text-lg">Loading proposals...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Proposals</h1>
            <p className="text-gray-600 text-sm lg:text-base">Manage your solar project proposals</p>
          </div>
          <Button onClick={() => router.push('/dashboard/proposals/create')} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Button>
        </div>

        {/* Proposals List */}
        <div className="grid grid-cols-1 gap-4 lg:gap-6">
          {proposals.map((proposal) => (
            <Card key={proposal._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center text-base lg:text-lg">
                      <FileText className="h-4 w-4 lg:h-5 lg:w-5 mr-2 flex-shrink-0" />
                      <span className="truncate">{proposal.proposalNumber}</span>
                    </CardTitle>
                    <CardDescription className="text-sm truncate">
                      Client: {proposal.clientName} | {proposal.plantCapacity} KW {proposal.projectType}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(proposal._id)}
                        title="View proposal"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(proposal._id)}
                        title="Edit proposal"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(proposal._id, proposal.proposalNumber)}
                        title="Download PDF"
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateClick(proposal._id)}
                        title="Duplicate proposal"
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(proposal._id)}
                        title="Delete proposal"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs lg:text-sm text-gray-600">
                  <div>
                    <p className="font-medium">Total: ₹{proposal.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p>Location: {proposal.projectLocation}</p>
                  </div>
                  <div>
                    <p>Valid Until: {new Date(proposal.validUntil).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p>Created: {new Date(proposal.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {proposals.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No proposals found</p>
            <p className="text-sm text-gray-400">Create your first proposal to get started</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!proposalToDelete} onOpenChange={() => setProposalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the proposal.
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

      <AlertDialog open={!!proposalToDuplicate} onOpenChange={() => setProposalToDuplicate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to create a copy of this proposal? A new proposal will be created with Draft status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDuplicate}>
              Duplicate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
