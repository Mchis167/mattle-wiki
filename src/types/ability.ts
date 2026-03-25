export interface Ability {
  _id: string;
  _type: "ability";
  name: string;
  slug: { current: string };
  image: any;
  description: string;
  abilityType: "Active" | "Passive";
  subType: "AoE" | "Single" | "Buff" | "Debuff";
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  character?: { _ref: string; _type: "reference" };
  stats?: Array<{
    statName: string;
    statValue: number;
    upgradeTable?: {
      columns?: string[];
      values?: number[];
    };
  }>;
  audio?: {
    audioName: string;
    audioSource: string;
  };
  inGameVideos?: Array<{
    videoSource: string;
    videoThumb: any;
  }>;
}
