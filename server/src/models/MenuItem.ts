import { Schema, model, type InferSchemaType } from 'mongoose';

export const MENU_CATEGORIES = ['coffee', 'tea', 'cold-drinks', 'bakes', 'snacks'] as const;
export const DIETARY_TAGS = ['vegan', 'gluten-free'] as const;

const menuItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, enum: MENU_CATEGORIES, required: true },
    price: { type: Number, required: true, min: 0 }, // whole rupees
    description: { type: String, required: true, maxlength: 300 },
    dietaryTags: { type: [String], enum: DIETARY_TAGS, default: [] },
    image: { type: String, default: null },
    isSignature: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type MenuItemDoc = InferSchemaType<typeof menuItemSchema>;
export const MenuItem = model('MenuItem', menuItemSchema);
