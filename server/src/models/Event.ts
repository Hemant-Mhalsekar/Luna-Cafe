import { Schema, model } from 'mongoose';

const signupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } },
);

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: { type: String, enum: ['game-night', 'tournament'], required: true },
    date: { type: String, required: true }, // YYYY-MM-DD café time
    startTime: { type: String, required: true }, // HH:MM
    description: { type: String, required: true, maxlength: 600 },
    capacity: { type: Number, required: true, min: 1, max: 200 },
    signups: { type: [signupSchema], default: [] },
  },
  { timestamps: true },
);

export const Event = model('Event', eventSchema);
