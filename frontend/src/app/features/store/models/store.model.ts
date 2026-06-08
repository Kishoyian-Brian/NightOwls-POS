/** Where stock is held inside the club */
export type StoreLocation = 'store' | 'kitchen' | 'bar' | 'club';

export interface StoreItem {
    id: string;
    name: string;
    category: string;
    unit: string;
    store: number;
    kitchen: number;
    bar: number;
    club: number;
}

export type StoreMovementType = 'receive' | 'transfer';

export interface StoreMovement {
    id: string;
    itemId: string;
    itemName: string;
    type: StoreMovementType;
    quantity: number;
    from: StoreLocation | 'market';
    to: StoreLocation;
    note?: string;
    createdAt: string;
    recordedBy: string;
}

export const STORE_LOCATION_LABELS: Record<StoreLocation, string> = {
    store: 'Main Store',
    kitchen: 'Kitchen',
    bar: 'Bar',
    club: 'Club Floor',
};

export const STORE_CATEGORIES = [
    'produce', 'meat', 'dry-goods', 'beverages', 'cleaning', 'supplies',
] as const;

export interface StoreImportResult {
    received: number;
    created: number;
    skipped: number;
    errors: string[];
}
