import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  tenantId: string;
  businessDetails?: {
    businessName: string;
    tagline?: string;
    gstNumber?: string;
    address?: string;
    logo?: string;
    signature?: string;
    phone?: string;
    landline?: string;
    email?: string;
    website?: string;
    bankDetails?: {
      accountName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      branch?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  tenantId: {
    type: String,
    required: true,
    unique: true,
  },
  businessDetails: {
    businessName: {
      type: String,
      default: '',
    },
    tagline: {
      type: String,
      default: '',
    },
    gstNumber: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    signature: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    landline: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    bankDetails: {
      accountName: {
        type: String,
        default: '',
      },
      accountNumber: {
        type: String,
        default: '',
      },
      ifscCode: {
        type: String,
        default: '',
      },
      bankName: {
        type: String,
        default: '',
      },
      branch: {
        type: String,
        default: '',
      },
    },
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
