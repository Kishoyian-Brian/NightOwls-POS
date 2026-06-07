/** Roles that can sign in to the POS */
export type LoginRole = 'waiter' | 'manager' | 'bar' | 'kitchen' | 'store';

/** On-site staff tracked as employee records (no system login) */
export type RecordOnlyRole = 'cook' | 'bouncer' | 'security' | 'janitor';

export type StaffRole = LoginRole | RecordOnlyRole;

export interface AppUser {
    username: string;
    password: string;
    role: StaffRole;
}

/** Only these roles may sign in — all other staff are employee records only */
export const LOGIN_ROLES: LoginRole[] = ['waiter', 'manager', 'bar', 'kitchen', 'store'];

export const RECORD_ONLY_ROLES: RecordOnlyRole[] = [
    'cook', 'bouncer', 'security', 'janitor',
];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
    waiter: 'Waiter',
    manager: 'Manager',
    bar: 'Bartender',
    kitchen: 'Kitchen',
    store: 'Store Keeper',
    cook: 'Cook',
    bouncer: 'Bouncer',
    security: 'Security',
    janitor: 'Janitor',
};

export function isLoginRole(role: StaffRole): role is LoginRole {
    return (LOGIN_ROLES as readonly string[]).includes(role);
}
