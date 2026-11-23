import { Schema, model } from 'mongoose';

const tableSchema = new Schema({
  number: { type: Number, required: true, unique: true, min: 1 },
  capacity: { type: Number, required: true, min: 1, max: 12 },
});

export const Table = model('Table', tableSchema);
