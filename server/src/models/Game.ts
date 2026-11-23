import { Schema, model, type InferSchemaType } from 'mongoose';

export const GAME_TYPES = ['party', 'strategy', 'cooperative', 'word', 'dexterity'] as const;
export const GAME_MOODS = ['chill', 'competitive', 'silly', 'brainy'] as const;
export const GAME_ACCENTS = ['blue', 'terracotta', 'mustard', 'lavender'] as const;

const gameSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: { type: String, enum: GAME_TYPES, required: true },
    minPlayers: { type: Number, required: true, min: 1, max: 20 },
    maxPlayers: { type: Number, required: true, min: 1, max: 20 },
    playTimeMinutes: { type: Number, required: true, min: 5, max: 300 },
    difficulty: { type: Number, required: true, min: 1, max: 3 },
    moods: { type: [String], enum: GAME_MOODS, default: [] },
    description: { type: String, required: true, maxlength: 400 },
    rulesSummary: { type: String, required: true, maxlength: 1200 },
    accent: { type: String, enum: GAME_ACCENTS, required: true },
    isInvented: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

gameSchema.path('maxPlayers').validate(function (this: { minPlayers: number }, v: number) {
  return v >= this.minPlayers;
}, 'maxPlayers must be at least minPlayers');

export type GameDoc = InferSchemaType<typeof gameSchema>;
export const Game = model('Game', gameSchema);
