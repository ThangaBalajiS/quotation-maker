import mongoose, { Document, Schema } from 'mongoose';

export interface IBrandImage extends Document {
  tenantId: string;
  imageUrl: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const BrandImageSchema = new Schema<IBrandImage>({
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Compound index for efficient querying by tenant and sorting by order
BrandImageSchema.index({ tenantId: 1, order: 1 });

export default mongoose.models.BrandImage || mongoose.model<IBrandImage>('BrandImage', BrandImageSchema);
