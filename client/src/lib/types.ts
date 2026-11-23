// Shapes returned by the API. Keep in sync with server/src/models.

export type GameType = 'party' | 'strategy' | 'cooperative' | 'word' | 'dexterity';
export type GameMood = 'chill' | 'competitive' | 'silly' | 'brainy';
export type Accent = 'blue' | 'terracotta' | 'mustard' | 'lavender';

export interface Game {
  _id: string;
  name: string;
  slug: string;
  type: GameType;
  minPlayers: number;
  maxPlayers: number;
  playTimeMinutes: number;
  difficulty: 1 | 2 | 3;
  moods: GameMood[];
  description: string;
  rulesSummary: string;
  accent: Accent;
  isInvented: boolean;
}

export type MenuCategory = 'coffee' | 'tea' | 'cold-drinks' | 'bakes' | 'snacks';
export type DietaryTag = 'vegan' | 'gluten-free';

export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  category: MenuCategory;
  price: number;
  description: string;
  dietaryTags: DietaryTag[];
  image: string | null;
  isSignature: boolean;
}

export type SlotStatus = 'free' | 'full' | 'past' | 'closed';

export interface SlotAvailability {
  slotId: string;
  label: string;
  status: SlotStatus;
}

export interface ReservationRequest {
  name: string;
  email: string;
  phone: string;
  date: string;
  slotId: string;
  partySize: number;
  gameId?: string | null;
}

export interface ReservationConfirmation {
  referenceCode: string;
  name: string;
  date: string;
  slotId: string;
  partySize: number;
  tableNumber: number;
  gameId: string | null;
}

export interface SlotSuggestion {
  date: string;
  slotId: string;
  label: string;
}

export const DIFFICULTY_LABEL: Record<Game['difficulty'], string> = { 1: 'Easy', 2: 'Medium', 3: 'Tricky' };

export const CATEGORY_LABEL: Record<MenuCategory, string> = {
  coffee: 'Coffee',
  tea: 'Tea',
  'cold-drinks': 'Cold drinks',
  bakes: 'Bakes',
  snacks: 'Snacks',
};

export const DIETARY_LABEL: Record<DietaryTag, string> = { vegan: 'Vegan', 'gluten-free': 'Gluten-free' };

export interface PublicEvent {
  _id: string;
  title: string;
  slug: string;
  type: 'game-night' | 'tournament';
  date: string;
  startTime: string;
  description: string;
  capacity: number;
  spotsLeft: number;
}
