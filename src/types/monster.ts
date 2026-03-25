export interface Monster {
  _id: string;
  _type: "monster";
  name: string;
  slug: { current: string };
  image: any;
  description: string;
  monsterType: "Melee" | "Ranged";
  collection: "Normal" | "MiniBoss" | "Boss";
  spawnTime: number;
  stats?: Array<{
    statName: string;
    statValue: number;
  }>;
  abilities?: Array<{
    name: string;
    description: string;
    videoSource?: string;
  }>;
  dropRateGems?: Array<{
    gemColor: "blue" | "green" | "red" | "purple";
    dropRate: number;
  }>;
  dropRateChests?: Array<{
    chestName: string;
    dropRate: number;
  }>;
}
