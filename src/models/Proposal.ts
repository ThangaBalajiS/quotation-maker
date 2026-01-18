import mongoose, { Document, Schema } from 'mongoose';

// Material item interface for Bill of Materials
export interface IProposalMaterial {
  description: string;
  specification: string;
  warranty: string;
}

// ROI data interface
export interface IProposalROI {
  energyGenerationPerYear: number; // kWh/year
  co2SavingsPerYear: number; // tonnes/year
  paybackPeriodMin: number; // years
  paybackPeriodMax: number; // years
  totalSavings25Years: number; // rupees
  treesEquivalent: number;
  co2EliminatedTotal: number; // tonnes
}

// Main Proposal interface
export interface IProposal extends Document {
  tenantId: string;
  quotationId?: string; // Link to source quotation
  proposalNumber: string;
  date: Date;
  
  // Client info
  clientName: string;
  projectLocation: string;
  
  // Project specs
  plantCapacity: number; // in KW
  projectType: 'On-Grid Solar' | 'Off-Grid Solar' | 'Hybrid Solar';
  roofType: 'Sheeted Roof' | 'RCC Roof' | 'Ground Mounted';
  
  // Pricing
  pricePerKW: number;
  amount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  
  // Payment terms
  advancePercent: number;
  balancePercent: number;
  paymentTermsNotes?: string;
  
  // Materials list
  materials: IProposalMaterial[];
  
  // ROI data
  roi: IProposalROI;
  
  // Technical summary (editable text)
  technicalSummary?: string;
  financialSummary?: string;
  
  // Terms and conditions
  terms: string[];
  validUntil: Date;
  
  // Status
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ProposalMaterialSchema = new Schema<IProposalMaterial>({
  description: {
    type: String,
    required: true,
  },
  specification: {
    type: String,
    required: true,
  },
  warranty: {
    type: String,
    required: true,
  },
}, { _id: false });

const ProposalROISchema = new Schema<IProposalROI>({
  energyGenerationPerYear: {
    type: Number,
    default: 0,
  },
  co2SavingsPerYear: {
    type: Number,
    default: 0,
  },
  paybackPeriodMin: {
    type: Number,
    default: 2.5,
  },
  paybackPeriodMax: {
    type: Number,
    default: 3.5,
  },
  totalSavings25Years: {
    type: Number,
    default: 0,
  },
  treesEquivalent: {
    type: Number,
    default: 0,
  },
  co2EliminatedTotal: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const ProposalSchema = new Schema<IProposal>({
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  quotationId: {
    type: String,
    index: true,
  },
  proposalNumber: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  
  // Client info
  clientName: {
    type: String,
    required: true,
  },
  projectLocation: {
    type: String,
    required: true,
  },
  
  // Project specs
  plantCapacity: {
    type: Number,
    required: true,
    min: 0,
  },
  projectType: {
    type: String,
    enum: ['On-Grid Solar', 'Off-Grid Solar', 'Hybrid Solar'],
    default: 'On-Grid Solar',
  },
  roofType: {
    type: String,
    enum: ['Sheeted Roof', 'RCC Roof', 'Ground Mounted'],
    default: 'Sheeted Roof',
  },
  
  // Pricing
  pricePerKW: {
    type: Number,
    required: true,
    min: 0,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  gstRate: {
    type: Number,
    required: true,
    default: 8.9,
  },
  gstAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // Payment terms
  advancePercent: {
    type: Number,
    default: 70,
  },
  balancePercent: {
    type: Number,
    default: 30,
  },
  paymentTermsNotes: String,
  
  // Materials
  materials: [ProposalMaterialSchema],
  
  // ROI
  roi: {
    type: ProposalROISchema,
    default: () => ({}),
  },
  
  // Technical and financial summary
  technicalSummary: String,
  financialSummary: String,
  
  // Terms
  terms: [{
    type: String,
  }],
  validUntil: {
    type: Date,
    required: true,
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
    default: 'draft',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Proposal || mongoose.model<IProposal>('Proposal', ProposalSchema);
