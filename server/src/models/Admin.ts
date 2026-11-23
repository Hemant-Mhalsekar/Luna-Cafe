import { Schema, model } from 'mongoose';

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

export const Admin = model('Admin', adminSchema);
