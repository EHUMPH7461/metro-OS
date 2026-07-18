export type InventoryItem = {
  id: number;
  sku: string;
  title: string;
  category: string;
  brand: string;
  size: string;
  quantity: number;
  cost: number;
  listPrice: number;
  status: string;
  createdAt: string;
};

export type InventoryInput = Omit<InventoryItem, 'id' | 'createdAt'>;

declare global {
  interface Window {
    metro?: {
      inventory: {
        list: () => Promise<InventoryItem[]>;
        create: (input: InventoryInput) => Promise<InventoryItem>;
        update: (id: number, input: InventoryInput) => Promise<InventoryItem>;
        delete: (id: number) => Promise<boolean>;
      };
    };
  }
}
