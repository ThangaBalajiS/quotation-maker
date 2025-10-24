import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoiceItem {
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
  total: number;
}

export interface IInvoice extends Document {
  tenantId: string;
  invoiceNumber: string;
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
  items: IInvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  terms?: string;
  quotationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
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

const InvoiceSchema = new Schema<IInvoice>({
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
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
  items: [InvoiceItemSchema],
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
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paidDate: Date,
  notes: String,
  terms: String,
  quotationId: String,
}, {
  timestamps: true,
});

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
