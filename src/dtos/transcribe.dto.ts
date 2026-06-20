export interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface TranscribeResponse {
  transcript: string;
  items: ShoppingItem[];
}
