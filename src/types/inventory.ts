export type InventoryStatus = 'Draft' | 'Active' | 'Sold' | 'Archived';

export type InventoryItem = {
  id: number;
  sku: string;
  title: string;
  brand: string;
  category: string;
  gender: string;
  size: string;
  color: string;
  condition: string;
  purchasePrice: number;
  listPrice: number;
  shippingCost: number;
  ebayFees: number;
  profit: number;
  roi: number;
  quantity: number;
  bin: string;
  rack: string;
  shelf: string;
  drawer: string;
  supplier: string;
  purchaseDate: string;
  listingDate: string;
  soldDate: string;
  ebayItemId: string;
  status: InventoryStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type InventoryInput = Omit<InventoryItem, 'id' | 'profit' | 'roi' | 'createdAt' | 'updatedAt'>;

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
