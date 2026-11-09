export const ONE_WORD_NAMES = [
  'Aurora',
  'Cedar',
  'Solstice',
  'Cascade',
  'Summit',
  'Zephyr',
  'Haven',
  'Canyon',
  'Meadow',
  'Oasis',
  'Clover',
  'Orion',
  'Breeze',
  'Grove',
  'Harbor',
  'Horizon',
  'Lagoon',
  'Passage',
  'Ridge',
  'Glade',
  'Tide',
  'Sierra',
  'Dune',
  'Valley',
  'Prairie',
  'Echo',
  'Drift',
  'Timber',
  'Crest',
  'Brook',
  'Fjord',
  'Spire',
  'Lotus',
  'Willow',
  'Zenith',
  'Terra',
  'Canopy',
  'Peak',
  'Glacier',
  'Pinnacle',
  'Ravine',
  'River',
  'Basin',
  'Cliff',
  'Isle',
  'Reef',
  'Bramble',
  'Fern',
  'Moss',
  'Ember',
  'Gale',
  'Quarry',
  'Opal',
  'Lichen',
  'Solitude',
  'Cove',
  'Bluff',
  'Grotto',
  'Vale',
  'Dapple',
] as const;

export const ADJECTIVES = [
  'Cosmic',
  'Brisk',
  'Velvet',
  'Lunar',
  'Nimble',
  'Sunny',
  'Silent',
  'Misty',
  'Amber',
  'Golden',
  'Silver',
  'Rustic',
  'Wild',
  'Gentle',
  'Quiet',
  'Starlit',
  'Swift',
  'Crisp',
  'Brave',
  'Serene',
  'Clever',
  'Bright',
  'Dappled',
  'Cobalt',
  'Teal',
  'Mellow',
  'Copper',
  'Shadow',
  'Frosty',
  'Roaring',
  'Astral',
  'Verdant',
  'Twilight',
  'Boreal',
  'Solitary',
  'Wandering',
  'Vivid',
  'Radiant',
  'Humble',
  'Sylvan',
] as const;

export const NOUNS = [
  // Animals
  'Sparrow',
  'Otter',
  'Fox',
  'Finch',
  'Badger',
  'Falcon',
  'Robin',
  'Lynx',
  'Beaver',
  'Panda',
  'Hedgehog',
  'Dolphin',
  'Eagle',
  'Hawk',
  'Raven',
  'Puffin',
  'Seal',
  'Owl',
  'Heron',
  'Koala',
  'Wolf',
  'Crane',
  'Bear',
  'Swallow',
  // Nature & Celestial
  'Comet',
  'Nova',
  'Pebble',
  'Glacier',
  'Summit',
  'Canyon',
  'River',
  'Meadow',
  'Meteor',
  'Asteroid',
  'Lagoon',
  'Ridge',
  'Grove',
  'Valley',
  'Breeze',
  'Constellation',
] as const;

function pickRandom<T>(items: readonly T[]): T {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

export function pickCandidateName(): string {
  // 50% chance of 1-word calm/nature name, 50% chance of 2-word playful pair
  if (Math.random() < 0.5) {
    return pickRandom(ONE_WORD_NAMES);
  }
  const adjective = pickRandom(ADJECTIVES);
  const noun = pickRandom(NOUNS);
  return `${adjective} ${noun}`;
}

export function generateFolderName(
  existingNames: string[] = [],
  maxAttempts = 50,
): string {
  const normalizedExisting = new Set(
    existingNames.map((name) => name.trim().toLowerCase()),
  );

  for (let i = 0; i < maxAttempts; i++) {
    const candidate = pickCandidateName();
    if (!normalizedExisting.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  // Fallback: pick candidate and append incrementing suffix if candidate already exists
  const base = pickCandidateName();
  if (!normalizedExisting.has(base.toLowerCase())) {
    return base;
  }

  let counter = 2;
  while (normalizedExisting.has(`${base} ${counter}`.toLowerCase())) {
    counter++;
  }
  return `${base} ${counter}`;
}
