import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  tenantId: string;
  businessDetails?: {
    businessName: string;
    gstNumber?: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    logo?: string;
    signature?: string;
    phone?: string;
    email?: string;
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
    gstNumber: {
      type: String,
      default: '',
    },
    address: {
      street: {
        type: String,
        default: '',
      },
      city: {
        type: String,
        default: '',
      },
      state: {
        type: String,
        default: '',
      },
      pincode: {
        type: String,
        default: '',
      },
      country: {
        type: String,
        default: 'India',
      },
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
    email: {
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
