import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppUser, isLoginRole, LoginRole, StaffRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private readonly USER_KEY = 'cm_user';
    private readonly SESSION_KEY = 'cm_session';

    constructor(private router: Router) {
        this.seedUsers();
        this.syncStoredUsers();
    }

    private seedUsers(): void {
        if (!localStorage.getItem(this.USER_KEY)) {
            localStorage.setItem(this.USER_KEY, JSON.stringify([
                { username: 'waiter', password: '1234', role: 'waiter' },
                { username: 'manager', password: '0000', role: 'manager' },
                { username: 'bar', password: '5678', role: 'bar' },
                { username: 'kitchen', password: '9999', role: 'kitchen' },
            ] satisfies AppUser[]));
        }
    }

    private syncStoredUsers(): void {
        const users = this.readUsersRaw();
        let changed = false;

        const synced = users.map(u => {
            if (u.username === 'cook' && u.role === 'cook' && !users.some(x => x.role === 'kitchen')) {
                changed = true;
                return { ...u, username: 'kitchen', role: 'kitchen' as const };
            }
            return u;
        });

        if (!synced.some(u => u.role === 'kitchen')) {
            synced.push({ username: 'kitchen', password: '9999', role: 'kitchen' });
            changed = true;
        }

        if (changed) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(synced));
        }

        const session = this.getCurrentUser();
        if (session && !isLoginRole(session.role)) {
            localStorage.removeItem(this.SESSION_KEY);
        }
    }

    private readUsersRaw(): AppUser[] {
        return JSON.parse(localStorage.getItem(this.USER_KEY) || '[]') as AppUser[];
    }

    getStaff(): AppUser[] {
        this.syncStoredUsers();
        return this.readUsersRaw();
    }

    canLogin(role: StaffRole): role is LoginRole {
        return isLoginRole(role);
    }

    login(username: string, password: string): 'ok' | 'invalid' | 'no-access' {
        const lookup = username.trim();
        const user = this.getStaff().find(u => u.username === lookup && u.password === password);
        if (!user) return 'invalid';
        if (!this.canLogin(user.role)) return 'no-access';
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
        return 'ok';
    }

    logout(): void {
        localStorage.removeItem(this.SESSION_KEY);
        this.router.navigate(['/login']);
    }

    getCurrentUser(): AppUser | null {
        const session = localStorage.getItem(this.SESSION_KEY);
        if (!session) return null;
        const user = JSON.parse(session) as AppUser;
        if (!this.canLogin(user.role)) {
            localStorage.removeItem(this.SESSION_KEY);
            return null;
        }
        return user;
    }

    isLoggedIn(): boolean {
        return !!this.getCurrentUser();
    }

    homeRouteFor(role: LoginRole): string {
        return `/${role}`;
    }

    canAccessAdmin(): boolean {
        return this.getCurrentUser()?.role === 'manager';
    }

    isManager(): boolean {
        return this.getCurrentUser()?.role === 'manager';
    }

    isKitchen(): boolean {
        return this.getCurrentUser()?.role === 'kitchen';
    }

    resetPassword(username: string, newPassword: string): boolean {
        const users = this.getStaff();
        const index = users.findIndex(u => u.username === username);
        if (index === -1) return false;
        users[index].password = newPassword;
        localStorage.setItem(this.USER_KEY, JSON.stringify(users));
        return true;
    }
}
