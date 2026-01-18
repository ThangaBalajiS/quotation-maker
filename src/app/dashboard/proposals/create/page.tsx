'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, Save, FileText, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface QuotationItem {
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
}

interface Quotation {
  _id: string;
  quotationNumber: string;
  customerName: string;
  customerAddress?: {
    street?: string;
    city?: string;
    state?: string;
  };
  items: QuotationItem[];
  total: number;
  createdAt: string;
}

interface Material {
  description: string;
  specification: string;
  warranty: string;
}

const DEFAULT_TERMS = [
  'Proposal Validation till [VALID_DATE].',
  'Net Metering: Statutory fees are extra and paid by the customer. We will assist with the online application and EB visits.',
  'Scope: Tools, tackles, and transportation are included in our scope.',
  'Client Scope: Construction power, water, and ladder access for future maintenance.',
  'Maintenance: 1 Year AMC is included for free.',
];

export default function CreateProposalPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loadingQuotations, setLoadingQuotations] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [clientName, setClientName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [plantCapacity, setPlantCapacity] = useState<number>(10.2);
  const [projectType, setProjectType] = useState<'On-Grid' | 'Off-Grid' | 'Hybrid'>('On-Grid');
  const [roofType, setRoofType] = useState('Sheeted Roof');
  const [pricePerKW, setPricePerKW] = useState<number>(38500);
  const [gstRate, setGstRate] = useState<number>(8.9);
  const [advancePercent, setAdvancePercent] = useState<number>(70);
  const [balancePercent, setBalancePercent] = useState<number>(30);
  const [paymentTermsNotes, setPaymentTermsNotes] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]); // Start empty - populate from quotation
  const [terms, setTerms] = useState<string[]>(DEFAULT_TERMS);
  const [validUntil, setValidUntil] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });

  // Fetch quotations on mount
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await fetch('/api/quotations');
        if (response.ok) {
          const data = await response.json();
          setQuotations(data);
        }
      } catch (error) {
        console.error('Error fetching quotations:', error);
        toast.error('Failed to load quotations');
      } finally {
        setLoadingQuotations(false);
      }
    };
    fetchQuotations();
  }, []);

  // Calculated values
  const amount = plantCapacity * pricePerKW;
  const gstAmount = amount * (gstRate / 100);
  const totalAmount = amount + gstAmount;

  // ROI calculations (auto-calculated based on plant capacity)
  const energyGenerationPerYear = Math.round(plantCapacity * 1600);
  const co2SavingsPerYear = Math.round(plantCapacity * 1.3 * 10) / 10;
  const totalSavings22Years = Math.round(plantCapacity * 1600 * 8 * 22);
  const treesEquivalent = Math.round(plantCapacity * 62);
  const co2EliminatedTotal = Math.round(plantCapacity * 1.3 * 22);

  const filteredQuotations = quotations.filter(q =>
    q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectQuotation = async (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setClientName(quotation.customerName);
    const location = quotation.customerAddress?.city || quotation.customerAddress?.street || '';
    setProjectLocation(location);

    // Convert quotation items to materials
    if (quotation.items && quotation.items.length > 0) {
      const materialsFromQuotation: Material[] = quotation.items.map(item => ({
        description: item.productName,
        specification: item.description || `${item.quantity} ${item.unit}`,
        warranty: '', // User can fill this in
      }));
      setMaterials(materialsFromQuotation);
    } else {
      // If no items, start with empty materials list
      setMaterials([]);
    }

    setStep(2);
  };

  const handleSkipQuotation = () => {
    setSelectedQuotation(null);
    setMaterials([]); // Start with empty materials
    setStep(2);
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
      // Replace [VALID_DATE] placeholder in terms
      const processedTerms = terms.map(term =>
        term.replace('[VALID_DATE]', new Date(validUntil).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric'
        }))
      );

      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId: selectedQuotation?._id,
          clientName,
          projectLocation,
          plantCapacity,
          projectType: `${projectType} Solar`,
          roofType,
          pricePerKW,
          gstRate,
          advancePercent,
          balancePercent,
          paymentTermsNotes,
          materials,
          roi: {
            energyGenerationPerYear,
            co2SavingsPerYear,
            paybackPeriodMin: 2.5,
            paybackPeriodMax: 3.5,
            totalSavings25Years: totalSavings22Years,
            treesEquivalent,
            co2EliminatedTotal,
          },
          terms: processedTerms,
          validUntil,
        }),
      });

      if (response.ok) {
        toast.success('Proposal created successfully');
        router.push('/dashboard/proposals');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create proposal');
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error('Error creating proposal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => step === 1 ? router.back() : setStep(1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 1 ? 'Back' : 'Select Different Quotation'}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Proposal</h1>
            <p className="text-sm text-gray-500">Step {step} of 2</p>
          </div>
        </div>

        {/* Step 1: Select Quotation */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Select a Quotation
              </CardTitle>
              <p className="text-sm text-gray-500">
                Select a quotation to pre-fill customer details and line items, or skip to create from scratch.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search by customer name or quotation number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {loadingQuotations ? (
                <div className="text-center py-8 text-gray-500">Loading quotations...</div>
              ) : filteredQuotations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No quotations found matching your search' : 'No quotations available'}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredQuotations.map((quotation) => (
                    <div
                      key={quotation._id}
                      onClick={() => handleSelectQuotation(quotation)}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{quotation.customerName}</p>
                        <p className="text-sm text-gray-500">
                          {quotation.quotationNumber} • ₹{quotation.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {quotation.items?.length || 0} items • {new Date(quotation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t">
                <Button variant="outline" onClick={handleSkipQuotation} className="w-full">
                  Skip - Create Proposal from Scratch
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Proposal Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {selectedQuotation && (
              <div className="bg-blue-50 p-4 rounded-lg text-sm">
                <p className="font-medium text-blue-800">
                  Based on: {selectedQuotation.quotationNumber} - {selectedQuotation.customerName}
                </p>
                <p className="text-blue-600">
                  {selectedQuotation.items?.length || 0} line items imported from quotation
                </p>
              </div>
            )}

            {/* Client & Project */}
            <Card>
              <CardHeader>
                <CardTitle>Client & Project Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client Name *</label>
                  <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Project Location *</label>
                  <Input value={projectLocation} onChange={(e) => setProjectLocation(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Plant Capacity (kW) *</label>
                  <Input type="number" step="0.1" value={plantCapacity} onChange={(e) => setPlantCapacity(parseFloat(e.target.value) || 0)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Project Type</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as 'On-Grid' | 'Off-Grid' | 'Hybrid')}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="On-Grid">On-Grid</option>
                    <option value="Off-Grid">Off-Grid</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Roof Type</label>
                  <Input value={roofType} onChange={(e) => setRoofType(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valid Until</label>
                  <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price Per KW (₹) *</label>
                    <Input type="number" value={pricePerKW} onChange={(e) => setPricePerKW(parseFloat(e.target.value) || 0)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">GST Rate (%)</label>
                    <Input type="number" step="0.1" value={gstRate} onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Amount</label>
                    <div className="p-2 bg-gray-100 rounded font-bold text-lg">₹ {totalAmount.toLocaleString('en-IN')}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Advance (%)</label>
                    <Input type="number" value={advancePercent} onChange={(e) => setAdvancePercent(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Balance (%)</label>
                    <Input type="number" value={balancePercent} onChange={(e) => setBalancePercent(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bill of Materials */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Bill of Materials</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddMaterial}>
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>
                {materials.length === 0 && (
                  <p className="text-sm text-gray-500">No materials added. Click &quot;Add Item&quot; to add line items.</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {materials.map((material, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-4">
                      <Input
                        placeholder="Component"
                        value={material.description}
                        onChange={(e) => handleMaterialChange(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        placeholder="Specification"
                        value={material.specification}
                        onChange={(e) => handleMaterialChange(index, 'specification', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Warranty"
                        value={material.warranty}
                        onChange={(e) => handleMaterialChange(index, 'warranty', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveMaterial(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ROI Preview */}
            <Card>
              <CardHeader>
                <CardTitle>ROI Preview (Auto-calculated)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-gray-500">Energy/Year</p>
                    <p className="font-bold">{energyGenerationPerYear.toLocaleString()} kWh</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-gray-500">CO₂ Savings/Year</p>
                    <p className="font-bold">{co2SavingsPerYear} tonnes</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-gray-500">22-Year Savings</p>
                    <p className="font-bold">₹ {(totalSavings22Years / 100000).toFixed(1)} L</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="text-gray-500">Trees Equivalent</p>
                    <p className="font-bold">{treesEquivalent} trees</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Terms & Conditions</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddTerm}>
                    <Plus className="h-4 w-4 mr-1" /> Add Term
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {terms.map((term, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={term}
                      onChange={(e) => handleTermChange(index, e.target.value)}
                      rows={2}
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTerm(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Proposal'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
