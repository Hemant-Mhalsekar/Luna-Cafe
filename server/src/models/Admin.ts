import { Schema, model } from 'mongoose';

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    // Sessions issued before this moment are no longer accepted (set when the password changes).
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Admin = model('Admin', adminSchema);
