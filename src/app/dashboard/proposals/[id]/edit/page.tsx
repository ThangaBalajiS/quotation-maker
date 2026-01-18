'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
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

export default function EditProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [plantCapacity, setPlantCapacity] = useState<number>(0);
  const [projectType, setProjectType] = useState('On-Grid Solar');
  const [roofType, setRoofType] = useState('Sheeted Roof');
  const [pricePerKW, setPricePerKW] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(8.9);
  const [advancePercent, setAdvancePercent] = useState<number>(70);
  const [balancePercent, setBalancePercent] = useState<number>(30);
  const [paymentTermsNotes, setPaymentTermsNotes] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState('draft');
  const [roi, setRoi] = useState<ROI>({
    energyGenerationPerYear: 0,
    co2SavingsPerYear: 0,
    paybackPeriodMin: 2.5,
    paybackPeriodMax: 3.5,
    totalSavings25Years: 0,
    treesEquivalent: 0,
    co2EliminatedTotal: 0,
  });

  // Calculated values
  const amount = plantCapacity * pricePerKW;
  const gstAmount = amount * (gstRate / 100);
  const totalAmount = amount + gstAmount;

  useEffect(() => {
    fetchProposal();
  }, [id]);

  const fetchProposal = async () => {
    try {
      const response = await fetch(`/api/proposals/${id}`);
      if (response.ok) {
        const data = await response.json();
        setClientName(data.clientName);
        setProjectLocation(data.projectLocation);
        setPlantCapacity(data.plantCapacity);
        setProjectType(data.projectType);
        setRoofType(data.roofType);
        setPricePerKW(data.pricePerKW);
        setGstRate(data.gstRate);
        setAdvancePercent(data.advancePercent);
        setBalancePercent(data.balancePercent);
        setPaymentTermsNotes(data.paymentTermsNotes || '');
        setMaterials(data.materials || []);
        setTerms(data.terms || []);
        setValidUntil(new Date(data.validUntil).toISOString().split('T')[0]);
        setStatus(data.status);
        if (data.roi) setRoi(data.roi);
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

  const handleAddMaterial = () => {
    setMaterials([...materials, { description: '', specification: '', warranty: '' }]);
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (index: number, field: keyof Material, value: string) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  const handleAddTerm = () => {
    setTerms([...terms, '']);
  };

  const handleRemoveTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleTermChange = (index: number, value: string) => {
    const updated = [...terms];
    updated[index] = value;
    setTerms(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName || !projectLocation || !plantCapacity || !pricePerKW) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      // Update ROI based on current capacity
      const updatedRoi = {
        ...roi,
        energyGenerationPerYear: Math.round(plantCapacity * 1600),
        co2SavingsPerYear: Math.round(plantCapacity * 1.3 * 10) / 10,
        totalSavings25Years: Math.round(plantCapacity * 1600 * 8 * 22),
        treesEquivalent: Math.round(plantCapacity * 62),
        co2EliminatedTotal: Math.round(plantCapacity * 1.3 * 22),
      };

      const response = await fetch(`/api/proposals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          projectLocation,
          plantCapacity,
          projectType,
          roofType,
          pricePerKW,
          gstRate,
          advancePercent,
          balancePercent,
          paymentTermsNotes,
          materials,
          roi: updatedRoi,
          terms,
          validUntil,
          status,
        }),
      });

      if (response.ok) {
        toast.success('Proposal updated successfully');
        router.push('/dashboard/proposals');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update proposal');
      }
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast.error('Error updating proposal');
    } finally {
      setSaving(false);
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

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Edit Proposal</h1>
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border rounded-md text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Client & Project Info */}
        <Card>
          <CardHeader>
            <CardTitle>Client & Project Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Client Name *</label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Mr. Dinakaran"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Location *</label>
              <Input
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                placeholder="e.g. Gandhi Nagar"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plant Capacity (KW) *</label>
              <Input
                type="number"
                step="0.1"
                value={plantCapacity}
                onChange={(e) => setPlantCapacity(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Type</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
              >
                <option value="On-Grid Solar">On-Grid Solar</option>
                <option value="Off-Grid Solar">Off-Grid Solar</option>
                <option value="Hybrid Solar">Hybrid Solar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Roof Type</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={roofType}
                onChange={(e) => setRoofType(e.target.value)}
              >
                <option value="Sheeted Roof">Sheeted Roof</option>
                <option value="RCC Roof">RCC Roof</option>
                <option value="Ground Mounted">Ground Mounted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid Until</label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price Per KW (₹) *</label>
              <Input
                type="number"
                value={pricePerKW}
                onChange={(e) => setPricePerKW(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GST Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={gstRate}
                onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount (Auto)</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md">₹ {amount.toLocaleString()}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GST Amount (Auto)</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md">₹ {gstAmount.toLocaleString()}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Amount (Auto)</label>
              <div className="px-3 py-2 bg-green-100 rounded-md font-bold">₹ {totalAmount.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Terms</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Advance (%)</label>
              <Input
                type="number"
                value={advancePercent}
                onChange={(e) => setAdvancePercent(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Balance (%)</label>
              <Input
                type="number"
                value={balancePercent}
                onChange={(e) => setBalancePercent(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Additional Notes</label>
              <Input
                value={paymentTermsNotes}
                onChange={(e) => setPaymentTermsNotes(e.target.value)}
                placeholder="Any additional payment terms..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Bill of Materials */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bill of Materials</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddMaterial}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {materials.map((material, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <Input
                    value={material.description}
                    onChange={(e) => handleMaterialChange(index, 'description', e.target.value)}
                    placeholder="e.g. Solar Panels"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Specification</label>
                  <Input
                    value={material.specification}
                    onChange={(e) => handleMaterialChange(index, 'specification', e.target.value)}
                    placeholder="e.g. 600Wp - Axitec"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Warranty</label>
                  <Input
                    value={material.warranty}
                    onChange={(e) => handleMaterialChange(index, 'warranty', e.target.value)}
                    placeholder="e.g. 10 years"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveMaterial(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {materials.length === 0 && (
              <p className="text-gray-500 text-center py-4">No materials added. Click &quot;Add Item&quot; to start.</p>
            )}
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Terms & Conditions</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddTerm}>
              <Plus className="h-4 w-4 mr-1" /> Add Term
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {terms.map((term, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={term}
                  onChange={(e) => handleTermChange(index, e.target.value)}
                  placeholder="Enter term..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveTerm(index)}
                  className="text-destructive self-start"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {terms.length === 0 && (
              <p className="text-gray-500 text-center py-4">No terms added. Click &quot;Add Term&quot; to start.</p>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
