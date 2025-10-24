import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  tenantId: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  hsnCode?: string;
  taxRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    default: 'pcs',
  },
  hsnCode: {
    type: String,
  },
  taxRate: {
    type: Number,
    required: true,
    default: 18,
    min: 0,
    max: 100,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
