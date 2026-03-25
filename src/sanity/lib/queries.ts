/**
 * GROQ Queries cho Mattle Wiki
 * Sẽ được điền dần khi xây dựng Phase 2 (Sanity Schemas)
 */

// --- Characters ---
export const ALL_CHARACTERS_QUERY = `
  *[_type == "character"] | order(name asc) {
    _id,
    name,
    slug,
    image,
    energyCons
  }
`;

export const CHARACTER_BY_SLUG_QUERY = `
  *[_type == "character" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    description,
    image,
    energyCons,
    health,
    armor,
    speed,
    luck,
    weapon-> { name, slug, image, description },
    skinImages,
    howToUnlock,
    specialSkins,
    inGameVideos
  }
`;

// --- Abilities ---
export const ALL_ABILITIES_QUERY = `
  *[_type == "ability"] | order(name asc) {
    _id,
    name,
    slug,
    image
  }
`;

export const ABILITY_BY_SLUG_QUERY = `
  *[_type == "ability" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    description,
    image,
    abilityType,
    subType,
    rarity,
    character-> { name, slug, image, description },
    stats,
    audio,
    inGameVideos
  }
`;

// --- Items ---
export const ALL_ITEMS_QUERY = `
  *[_type == "item"] | order(name asc) {
    _id,
    name,
    description,
    acquireThrough,
    image
  }
`;

// --- Monsters ---
export const ALL_MONSTERS_QUERY = `
  *[_type == "monster"] | order(name asc) {
    _id,
    name,
    slug,
    image
  }
`;

export const MONSTER_BY_SLUG_QUERY = `
  *[_type == "monster" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    description,
    image,
    monsterType,
    collection,
    spawnTime,
    stats,
    abilities,
    dropRateGems,
    dropRateChests
  }
`;
