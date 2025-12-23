import mongoose, { Document, Schema } from 'mongoose';

export interface IPresetItem {
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
}

export interface IPreset extends Document {
  tenantId: string;
  name: string;
  description?: string;
  items: IPresetItem[];
  createdAt: Date;
  updatedAt: Date;
}

const PresetItemSchema = new Schema<IPresetItem>({
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
    min: 1,
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
}, { _id: false });

const PresetSchema = new Schema<IPreset>({
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
  items: [PresetItemSchema],
}, {
  timestamps: true,
});

export default mongoose.models.Preset || mongoose.model<IPreset>('Preset', PresetSchema);
