import { Schema, model, type InferSchemaType } from 'mongoose';

export const RESERVATION_STATUSES = ['confirmed', 'cancelled'] as const;

const reservationSchema = new Schema(
  {
    referenceCode: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    date: { type: String, required: true }, // YYYY-MM-DD café time
    slotId: { type: String, required: true }, // e.g. "1930"
    partySize: { type: Number, required: true, min: 1 },
    tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', default: null },
    status: { type: String, enum: RESERVATION_STATUSES, default: 'confirmed' },
  },
  { timestamps: true },
);

/**
 * The rule that blocks double booking lives in the database, not only in code:
 * a table can hold one confirmed reservation per date and slot. Cancelled ones don't count,
 * so cancelling frees the slot. Two requests arriving at the same moment cannot both win.
 */
reservationSchema.index(
  { tableId: 1, date: 1, slotId: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' }, name: 'one_booking_per_table_slot' },
);
reservationSchema.index({ date: 1, slotId: 1, status: 1 });

/**
 * The café has one copy of each game, so a game can be reserved by one confirmed booking per date and
 * slot. Bookings without a game are not affected.
 */
reservationSchema.index(
  { gameId: 1, date: 1, slotId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'confirmed', gameId: { $type: 'objectId' } },
    name: 'one_booking_per_game_slot',
  },
);
reservationSchema.index({ createdAt: -1 });

export type ReservationDoc = InferSchemaType<typeof reservationSchema>;
export const Reservation = model('Reservation', reservationSchema);
