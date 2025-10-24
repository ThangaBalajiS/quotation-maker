import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  gstNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
  },
  phone: {
    type: String,
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India',
    },
  },
  gstNumber: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
