export interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
  location: string;
  notes: string;
}

export interface TranscribeResponse {
  transcript: string;
  items: ShoppingItem[];
}
