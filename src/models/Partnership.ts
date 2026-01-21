import mongoose, { Schema, models } from 'mongoose';

export interface IPartnership {
  fullname: string;
  zone?: string;
  overall_target: string;
  print_target: string;
  digital_target: string;
  wonder_sponsorship?: string;
  project_sponsorship?: string;
  crusade_sponsorship?: string;
  other_campaigns?: string;
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
    wonder_sponsorship: {
      type: String,
    },
    project_sponsorship: {
      type: String,
    },
    crusade_sponsorship: {
      type: String,
    },
    other_campaigns: {
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
