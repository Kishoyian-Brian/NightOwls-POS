export interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    category: string;
    price: number;
    itemType?: 'food' | 'drinks';
}

export interface Order {
    id: string;
    tableNumber: number;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'preparing' | 'ready' | 'served';
    receiptGenerated?: boolean;
    receiptGeneratedAt?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    type: 'food' | 'drinks' | 'mixed';
}
