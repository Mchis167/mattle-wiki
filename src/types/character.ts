export interface Character {
  _id: string;
  _type: "character";
  name: string;
  slug: {
    current: string;
  };
  image: any; // Sanity image type
  energyCons: number;
  description: string;
  health: number;
  armor: number;
  speed: number;
  luck: number;
  weapon: {
    _ref: string;
    _type: "reference";
  };
  skinImages?: any[];
  howToUnlock?: Array<{
    title: string;
    description: string;
    badgeLabel?: string;
    externalLink?: string;
  }>;
  specialSkins?: Array<{
    skinName: string;
    skinImage: any;
    description?: string;
    externalLink?: string;
  }>;
  inGameVideos?: Array<{
    videoSource: string;
    videoThumb: any;
  }>;
}
