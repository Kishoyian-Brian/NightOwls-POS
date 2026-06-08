import * as XLSX from 'xlsx';
import { STORE_CATEGORIES, StoreLocation } from '../models/store.model';

export interface StoreImportRow {
    name: string;
    quantity: number;
    category?: string;
    unit?: string;
    /** Where stock lands: store, kitchen, bar, or club. Drinks default to bar. */
    destination?: StoreLocation;
}

export interface ParsedStoreImport {
    rows: StoreImportRow[];
    errors: string[];
}

const NAME_KEYS = ['name', 'item', 'product', 'item name'];
const QTY_KEYS = ['quantity', 'qty', 'amount', 'count'];
const CATEGORY_KEYS = ['category', 'type'];
const UNIT_KEYS = ['unit', 'uom'];
const DESTINATION_KEYS = ['destination', 'to', 'location', 'send to'];

const DESTINATION_ALIASES: Record<string, StoreLocation> = {
    store: 'store',
    'main store': 'store',
    kitchen: 'kitchen',
    bar: 'bar',
    club: 'club',
    'club floor': 'club',
};

const DRINK_HINTS = ['beer', 'wine', 'spirit', 'whisky', 'whiskey', 'vodka', 'gin', 'rum', 'tequila', 'cider', 'champagne', 'liquor', 'drink', 'crate', 'bottle'];

function normalizeKey(key: string): string {
    return key.trim().toLowerCase().replace(/\s+/g, ' ');
}

function pickField(record: Record<string, unknown>, keys: string[]): string {
    for (const [rawKey, value] of Object.entries(record)) {
        const key = normalizeKey(rawKey);
        if (keys.includes(key) && value != null && String(value).trim()) {
            return String(value).trim();
        }
    }
    return '';
}

function parseQuantity(value: unknown): number | null {
    if (value == null || value === '') return null;
    const n = Number(String(value).replace(/,/g, '').trim());
    return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizeCategory(value: string): string {
    const lower = value.trim().toLowerCase();
    if ((STORE_CATEGORIES as readonly string[]).includes(lower)) return lower;
    return 'supplies';
}

function inferCategory(name: string, categoryRaw: string): string {
    if (categoryRaw) return normalizeCategory(categoryRaw);
    const lower = name.toLowerCase();
    if (DRINK_HINTS.some(h => lower.includes(h))) return 'beverages';
    return 'supplies';
}

function parseDestination(value: string): StoreLocation | undefined {
    const key = value.trim().toLowerCase();
    return DESTINATION_ALIASES[key];
}

function resolveDestination(category: string, destinationRaw: string): StoreLocation {
    const parsed = destinationRaw ? parseDestination(destinationRaw) : undefined;
    if (parsed) return parsed;
    if (category === 'beverages') return 'bar';
    return 'store';
}

function rowFromRecord(record: Record<string, unknown>, lineNo: number): StoreImportRow | string {
    const name = pickField(record, NAME_KEYS);
    let quantity: number | null = null;
    for (const [rawKey, value] of Object.entries(record)) {
        if (QTY_KEYS.includes(normalizeKey(rawKey))) {
            quantity = parseQuantity(value);
            break;
        }
    }
    const categoryRaw = pickField(record, CATEGORY_KEYS);
    const unitRaw = pickField(record, UNIT_KEYS);
    const destinationRaw = pickField(record, DESTINATION_KEYS);

    if (!name) return `Row ${lineNo}: missing item name`;
    if (quantity == null) return `Row ${lineNo} (${name}): invalid quantity`;

    const category = inferCategory(name, categoryRaw);
    const destination = resolveDestination(category, destinationRaw);
    if (destinationRaw && !parseDestination(destinationRaw)) {
        return `Row ${lineNo} (${name}): destination must be store, kitchen, bar, or club`;
    }

    return {
        name,
        quantity,
        category,
        unit: unitRaw || undefined,
        destination,
    };
}

function recordsFromObjects(objects: Record<string, unknown>[]): ParsedStoreImport {
    const rows: StoreImportRow[] = [];
    const errors: string[] = [];

    objects.forEach((obj, i) => {
        const lineNo = i + 2;
        const hasData = Object.values(obj).some(v => v != null && String(v).trim() !== '');
        if (!hasData) return;

        const result = rowFromRecord(obj, lineNo);
        if (typeof result === 'string') {
            errors.push(result);
        } else {
            rows.push(result);
        }
    });

    return { rows, errors };
}

function parseCsvLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            fields.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    fields.push(current.trim());
    return fields;
}

export function parseStoreCsv(text: string): ParsedStoreImport {
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
        return { rows: [], errors: ['File must include a header row and at least one data row.'] };
    }

    const headers = parseCsvLine(lines[0]).map(normalizeKey);
    const objects = lines.slice(1).map(line => {
        const values = parseCsvLine(line);
        const record: Record<string, unknown> = {};
        headers.forEach((header, i) => {
            record[header] = values[i] ?? '';
        });
        return record;
    });

    return recordsFromObjects(objects);
}

export function parseStoreExcel(buffer: ArrayBuffer): ParsedStoreImport {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) {
        return { rows: [], errors: ['Excel file has no sheets.'] };
    }

    const objects = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    if (!objects.length) {
        return { rows: [], errors: ['Excel sheet is empty.'] };
    }

    return recordsFromObjects(objects);
}

export const STORE_IMPORT_TEMPLATE = `name,quantity,category,unit,destination
Tomatoes,10,produce,kg,kitchen
Chicken breast,8,meat,kg,kitchen
Beer crates,12,beverages,crates,bar
Whisky boxes,4,beverages,boxes,bar
Napkins,20,supplies,packs,club
Cooking oil,5,dry-goods,L,store
`;

export function downloadStoreImportTemplate(): void {
    const blob = new Blob([STORE_IMPORT_TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'store-stock-template.csv';
    link.click();
    URL.revokeObjectURL(url);
}
