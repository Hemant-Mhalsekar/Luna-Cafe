import { Schema, model } from 'mongoose';

/** One "today's special" per café date. Falls back to a signature item when a day has none. */
const specialSchema = new Schema(
  {
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD café time
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    note: { type: String, maxlength: 160 },
  },
  { timestamps: true },
);

export const Special = model('Special', specialSchema);
