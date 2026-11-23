// Seed data. Real game names appear as text only (no logos or box art).
// Descriptions and rules summaries are our own short wording.

export const tables = [
  ...[1, 2, 3, 4].map((n) => ({ number: n, capacity: 2 })),
  ...[5, 6, 7, 8].map((n) => ({ number: n, capacity: 4 })),
  ...[9, 10].map((n) => ({ number: n, capacity: 6 })),
  { number: 11, capacity: 8 },
];

type Accent = 'blue' | 'terracotta' | 'mustard' | 'lavender';
type GameType = 'party' | 'strategy' | 'cooperative' | 'word' | 'dexterity';
type Mood = 'chill' | 'competitive' | 'silly' | 'brainy';

interface SeedGame {
  name: string;
  slug: string;
  type: GameType;
  minPlayers: number;
  maxPlayers: number;
  playTimeMinutes: number;
  difficulty: 1 | 2 | 3;
  moods: Mood[];
  accent: Accent;
  isInvented?: boolean;
  description: string;
  rulesSummary: string;
}

export const games: SeedGame[] = [
  {
    name: 'UNO', slug: 'uno', type: 'party', minPlayers: 2, maxPlayers: 10, playTimeMinutes: 30, difficulty: 1,
    moods: ['silly', 'competitive'], accent: 'mustard',
    description: 'The colour-and-number card game everyone already half knows.',
    rulesSummary: 'Match the top card by colour or number. Action cards skip, reverse or make the next player draw. Say "UNO" when you have one card left. First to empty their hand wins the round.',
  },
  {
    name: 'Jenga', slug: 'jenga', type: 'dexterity', minPlayers: 2, maxPlayers: 8, playTimeMinutes: 20, difficulty: 1,
    moods: ['silly', 'chill'], accent: 'terracotta',
    description: 'Pull a block, stack it on top, try not to breathe.',
    rulesSummary: 'Take turns removing one block from anywhere below the top level, using one hand, and place it on top. Whoever makes the tower fall loses.',
  },
  {
    name: 'Catan', slug: 'catan', type: 'strategy', minPlayers: 3, maxPlayers: 4, playTimeMinutes: 90, difficulty: 2,
    moods: ['competitive', 'brainy'], accent: 'blue',
    description: 'Trade, build and argue over sheep on an island of hexes.',
    rulesSummary: 'Roll dice to collect resources from tiles next to your settlements. Trade with others, then build roads, settlements and cities. First to 10 victory points wins.',
  },
  {
    name: 'Ticket to Ride', slug: 'ticket-to-ride', type: 'strategy', minPlayers: 2, maxPlayers: 5, playTimeMinutes: 60, difficulty: 2,
    moods: ['chill', 'competitive'], accent: 'blue',
    description: 'Collect coloured cards and claim train routes across the map.',
    rulesSummary: 'On your turn, draw train cards, claim a route by playing matching cards, or take new destination tickets. Score for routes and completed tickets; lose points for unfinished ones.',
  },
  {
    name: 'Codenames', slug: 'codenames', type: 'word', minPlayers: 4, maxPlayers: 8, playTimeMinutes: 20, difficulty: 1,
    moods: ['brainy', 'competitive'], accent: 'terracotta',
    description: 'Two teams, one-word clues, and a grid of very suspicious words.',
    rulesSummary: 'Each team\'s spymaster gives a one-word clue and a number. Teammates guess words on the grid. Find all your agents first, and never touch the assassin.',
  },
  {
    name: 'Wingspan', slug: 'wingspan', type: 'strategy', minPlayers: 1, maxPlayers: 5, playTimeMinutes: 70, difficulty: 3,
    moods: ['chill', 'brainy'], accent: 'blue',
    description: 'A calm engine-building game about attracting birds to your wildlife reserve.',
    rulesSummary: 'Each turn, play a bird, gain food, lay eggs or draw bird cards. Birds trigger powers that grow your engine. Highest score after four rounds wins.',
  },
  {
    name: 'Azul', slug: 'azul', type: 'strategy', minPlayers: 2, maxPlayers: 4, playTimeMinutes: 40, difficulty: 2,
    moods: ['chill', 'brainy'], accent: 'blue',
    description: 'Draft beautiful tiles and lay them into your own wall.',
    rulesSummary: 'Take all tiles of one colour from a display. Fill rows on your board; complete rows move a tile to your wall for points. Extra tiles fall to the floor and cost points.',
  },
  {
    name: 'Dixit', slug: 'dixit', type: 'party', minPlayers: 3, maxPlayers: 8, playTimeMinutes: 30, difficulty: 1,
    moods: ['chill', 'silly'], accent: 'mustard',
    description: 'Dreamy picture cards and clues that are not too obvious, not too vague.',
    rulesSummary: 'The storyteller gives a clue for one of their cards. Others add a card that fits. Everyone votes for the storyteller\'s card. Score when some, but not all, guess right.',
  },
  {
    name: 'Pandemic', slug: 'pandemic', type: 'cooperative', minPlayers: 2, maxPlayers: 4, playTimeMinutes: 45, difficulty: 2,
    moods: ['brainy'], accent: 'lavender',
    description: 'Work together to stop four diseases before time runs out.',
    rulesSummary: 'Each player has a special role. Move, treat disease and share cards to discover four cures. Outbreaks and the infection deck push back. Everyone wins or loses together.',
  },
  {
    name: 'Splendor', slug: 'splendor', type: 'strategy', minPlayers: 2, maxPlayers: 4, playTimeMinutes: 30, difficulty: 2,
    moods: ['competitive', 'chill'], accent: 'blue',
    description: 'Collect gems, buy mines and impress visiting nobles.',
    rulesSummary: 'Take gem tokens, reserve a card, or buy a development card. Cards give permanent discounts and points. First to 15 points triggers the final round.',
  },
  {
    name: 'Exploding Kittens', slug: 'exploding-kittens', type: 'party', minPlayers: 2, maxPlayers: 5, playTimeMinutes: 15, difficulty: 1,
    moods: ['silly'], accent: 'mustard',
    description: 'A card game of luck, cats and not drawing the wrong card.',
    rulesSummary: 'Play cards to skip, peek or shuffle, then draw. Draw an Exploding Kitten without a Defuse card and you are out. Last player standing wins.',
  },
  {
    name: 'Scrabble', slug: 'scrabble', type: 'word', minPlayers: 2, maxPlayers: 4, playTimeMinutes: 60, difficulty: 2,
    moods: ['brainy', 'competitive'], accent: 'terracotta',
    description: 'The classic crossword tile game.',
    rulesSummary: 'Place letter tiles to form words that connect to the board. Score letter values plus bonus squares. Draw back to seven tiles. Highest score when tiles run out wins.',
  },
  // Luna originals (invented for this project)
  {
    name: 'Moonlight Mischief', slug: 'moonlight-mischief', type: 'party', minPlayers: 3, maxPlayers: 8, playTimeMinutes: 25, difficulty: 1,
    moods: ['silly'], accent: 'lavender', isInvented: true,
    description: 'Sneak midnight snacks from the café kitchen without waking the owl.',
    rulesSummary: 'Everyone secretly picks a snack card. Roll the owl die: if it lands on your snack, you are caught and pass a cookie token left. Most cookies after five nights wins.',
  },
  {
    name: 'Latte Heist', slug: 'latte-heist', type: 'cooperative', minPlayers: 2, maxPlayers: 5, playTimeMinutes: 40, difficulty: 2,
    moods: ['brainy', 'silly'], accent: 'lavender', isInvented: true,
    description: 'A team of baristas plans the perfect heist of a rival\'s secret recipe.',
    rulesSummary: 'Draw plan cards and place crew members on the café map. Spend coffee beans to avoid alarms. Steal all three ingredient cards before the alarm track fills.',
  },
  {
    name: 'Crescent Cartographers', slug: 'crescent-cartographers', type: 'strategy', minPlayers: 2, maxPlayers: 4, playTimeMinutes: 75, difficulty: 3,
    moods: ['brainy', 'competitive'], accent: 'blue', isInvented: true,
    description: 'Map the hidden valleys of the moon, one crescent-shaped tile at a time.',
    rulesSummary: 'Draft terrain tiles and fit them into your map. Each moon phase reveals a scoring goal. Plan ahead: tiles you place early decide what you can score later.',
  },
  {
    name: 'Steam & Spoons', slug: 'steam-and-spoons', type: 'dexterity', minPlayers: 2, maxPlayers: 6, playTimeMinutes: 15, difficulty: 1,
    moods: ['silly', 'competitive'], accent: 'terracotta', isInvented: true,
    description: 'Balance spoons on a wobbly saucer tower. Fast, loud, very silly.',
    rulesSummary: 'Flip a card to see how many spoons to place. Use only the hand shown on the card. Drop a spoon and you keep it. Fewest spoons when the deck runs out wins.',
  },
  {
    name: 'Night Owl Riddles', slug: 'night-owl-riddles', type: 'word', minPlayers: 2, maxPlayers: 8, playTimeMinutes: 30, difficulty: 2,
    moods: ['chill', 'brainy'], accent: 'mustard', isInvented: true,
    description: 'Riddles whispered by an owl. Solve them in teams before the candle burns down.',
    rulesSummary: 'The reader draws a riddle card and flips the sand timer. Teams write answers secretly. Correct answers move your owl up the tree. First owl to the top wins.',
  },
];

type Category = 'coffee' | 'tea' | 'cold-drinks' | 'bakes' | 'snacks';
type Dietary = 'vegan' | 'gluten-free';

interface SeedMenuItem {
  name: string;
  slug: string;
  category: Category;
  price: number;
  description: string;
  dietaryTags?: Dietary[];
  isSignature?: boolean;
}

export const menuItems: SeedMenuItem[] = [
  { name: 'Moonlight Latte', slug: 'moonlight-latte', category: 'coffee', price: 220, isSignature: true, description: 'Double espresso, steamed milk, a hint of vanilla and a crescent of cinnamon on top.', dietaryTags: ['gluten-free'] },
  { name: 'Honey Cinnamon Cappuccino', slug: 'honey-cinnamon-cappuccino', category: 'coffee', price: 210, isSignature: true, description: 'Our house cappuccino with wild honey and a dusting of cinnamon.', dietaryTags: ['gluten-free'] },
  { name: 'Espresso', slug: 'espresso', category: 'coffee', price: 140, description: 'A short, chocolatey double shot of our house blend.', dietaryTags: ['vegan', 'gluten-free'] },
  { name: 'Flat White', slug: 'flat-white', category: 'coffee', price: 190, description: 'Ristretto with silky microfoam. Small, strong, smooth.', dietaryTags: ['gluten-free'] },
  { name: 'Cardamom Mocha', slug: 'cardamom-mocha', category: 'coffee', price: 230, description: 'Espresso, dark chocolate and green cardamom, finished with steamed milk.', dietaryTags: ['gluten-free'] },
  { name: 'Masala Chai', slug: 'masala-chai', category: 'tea', price: 120, description: 'Assam tea simmered with ginger, cardamom and clove.', dietaryTags: ['gluten-free'] },
  { name: 'Jasmine Green', slug: 'jasmine-green', category: 'tea', price: 150, description: 'Light green tea scented with jasmine blossoms.', dietaryTags: ['vegan', 'gluten-free'] },
  { name: 'Chamomile Moon Tea', slug: 'chamomile-moon-tea', category: 'tea', price: 160, description: 'Chamomile, lemon balm and lavender. Made for late game nights.', dietaryTags: ['vegan', 'gluten-free'] },
  { name: 'Iced Vanilla Cloud', slug: 'iced-vanilla-cloud', category: 'cold-drinks', price: 240, isSignature: true, description: 'Cold brew under a soft cloud of vanilla sweet cream.', dietaryTags: ['gluten-free'] },
  { name: 'Cold Brew Tonic', slug: 'cold-brew-tonic', category: 'cold-drinks', price: 230, description: 'Eighteen-hour cold brew over tonic and orange peel.', dietaryTags: ['vegan', 'gluten-free'] },
  { name: 'Mango Lassi', slug: 'mango-lassi', category: 'cold-drinks', price: 180, description: 'Alphonso mango blended with yoghurt and a pinch of cardamom.', dietaryTags: ['gluten-free'] },
  { name: 'Sparkling Lemon Mint', slug: 'sparkling-lemon-mint', category: 'cold-drinks', price: 150, description: 'Fresh lemon, mint and soda. Bright and not too sweet.', dietaryTags: ['vegan', 'gluten-free'] },
  { name: 'Butter Croissant', slug: 'butter-croissant', category: 'bakes', price: 160, description: 'Flaky, golden and baked every morning.' },
  { name: 'Banana Walnut Bread', slug: 'banana-walnut-bread', category: 'bakes', price: 150, description: 'A thick, warm slice with toasted walnuts.' },
  { name: 'Vegan Chocolate Brownie', slug: 'vegan-chocolate-brownie', category: 'bakes', price: 170, description: 'Fudgy dark chocolate brownie with sea salt.', dietaryTags: ['vegan'] },
  { name: 'Almond Orange Cake', slug: 'almond-orange-cake', category: 'bakes', price: 190, description: 'Moist almond-flour cake with candied orange.', dietaryTags: ['gluten-free'] },
  { name: 'Masala Fries', slug: 'masala-fries', category: 'snacks', price: 180, description: 'Crispy fries tossed in our house masala. Made for sharing over a game.', dietaryTags: ['vegan', 'gluten-free'] },
  { name: 'Paneer Tikka Sandwich', slug: 'paneer-tikka-sandwich', category: 'snacks', price: 240, description: 'Grilled paneer tikka, mint chutney and onions on sourdough.' },
  { name: 'Hummus & Pita', slug: 'hummus-and-pita', category: 'snacks', price: 220, description: 'Smooth hummus, olive oil and warm pita triangles.', dietaryTags: ['vegan'] },
  { name: 'Loaded Nachos', slug: 'loaded-nachos', category: 'snacks', price: 230, description: 'Corn chips, beans, cheese, salsa and jalapeños.', dietaryTags: ['gluten-free'] },
];

// Sample events, placed relative to the seed date so they are always upcoming.
// weekday: 0 = Sunday ... 6 = Saturday; daysAhead: earliest offset from today.
export const sampleEvents = [
  {
    slug: 'new-moon-game-night',
    title: 'New Moon Game Night',
    type: 'game-night' as const,
    weekday: 3,
    daysAhead: 2,
    startTime: '19:00',
    capacity: 30,
    description: 'Come alone or bring friends. We mix tables, teach the rules and keep the chai coming. Perfect if you are new to board games.',
  },
  {
    slug: 'codenames-cup',
    title: 'The Codenames Cup',
    type: 'tournament' as const,
    weekday: 6,
    daysAhead: 7,
    startTime: '17:30',
    capacity: 32,
    description: 'Teams of four, three rounds, one very small trophy. Sign up as a team or on your own and we will match you.',
  },
  {
    slug: 'cosy-strategy-sunday',
    title: 'Cosy Strategy Sunday',
    type: 'game-night' as const,
    weekday: 0,
    daysAhead: 10,
    startTime: '14:30',
    capacity: 20,
    description: 'A slow afternoon for longer games like Wingspan and Catan. Our game guru helps you set up and learn.',
  },
  {
    slug: 'full-moon-party-night',
    title: 'Full Moon Party Night',
    type: 'game-night' as const,
    weekday: 5,
    daysAhead: 17,
    startTime: '19:00',
    capacity: 40,
    description: 'Loud, silly, fast games: Moonlight Mischief, Dixit, Exploding Kittens. Laughter is basically guaranteed.',
  },
];
