export interface Item {
  _id: string;
  _type: "item";
  name: string;
  description: string;
  acquireThrough: "Chest" | "Store" | "Event";
  image: any;
}
