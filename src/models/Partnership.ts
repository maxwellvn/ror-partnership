import mongoose, { Schema, models } from 'mongoose';

export interface IPartnership {
  fullname: string;
  zone?: string;
  num_groups?: string;
  group?: string;
  overall_target: string;
  print_target: string;
  digital_target: string;
  campaigns?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PartnershipSchema = new Schema<IPartnership>(
  {
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    zone: {
      type: String,
      trim: true,
    },
    num_groups: {
      type: String,
      default: '0',
    },
    group: {
      type: String,
      trim: true,
    },
    overall_target: {
      type: String,
      default: '0',
    },
    print_target: {
      type: String,
      default: '0',
    },
    digital_target: {
      type: String,
      default: '0',
    },
    campaigns: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Partnership = models.Partnership || mongoose.model<IPartnership>('Partnership', PartnershipSchema);

export default Partnership;
