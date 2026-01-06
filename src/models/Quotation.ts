import mongoose, { Document, Schema } from 'mongoose';

export interface IQuotationItem {
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
  total: number;
}

export interface IQuotation extends Document {
  tenantId: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: IQuotationItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  includeGst: boolean;
  hideItemPrices: boolean;
  status: 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: Date;
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationItemSchema = new Schema<IQuotationItem>({
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  description: String,
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  taxRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const QuotationSchema = new Schema<IQuotation>({
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  quotationNumber: {
    type: String,
    required: true
  },
  customerId: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: String,
  customerPhone: String,
  customerAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
  },
  items: [QuotationItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['sent', 'accepted', 'rejected', 'expired'],
    default: 'sent',
  },
  includeGst: {
    type: Boolean,
    default: true,
  },
  hideItemPrices: {
    type: Boolean,
    default: false,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  notes: String,
  terms: String,
}, {
  timestamps: true,
});

export default mongoose.models.Quotation || mongoose.model<IQuotation>('Quotation', QuotationSchema);
