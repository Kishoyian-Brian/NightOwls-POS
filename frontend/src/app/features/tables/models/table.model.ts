export type TableStatus = 'free' | 'occupied';

export interface ClubTable {
    number: number;
    status: TableStatus;
    openOrderId?: string;
}
