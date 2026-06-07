import { Injectable } from '@angular/core';
import { AuthService } from '../../../core/authentication/services/auth.service';
import { AppUser, isLoginRole } from '../../../core/authentication/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly PROTECTED = ['waiter', 'manager', 'bar', 'kitchen', 'store'];

    constructor(private auth: AuthService) {}

    getUsers(): AppUser[] {
        return this.auth.getStaff();
    }

    addUser(user: AppUser): boolean {
        if (isLoginRole(user.role) && (!user.password || user.password === '—')) {
            return false;
        }
        if (!isLoginRole(user.role)) {
            user = { ...user, password: '—' };
        }
        const users = this.getUsers();
        if (users.some(u => u.username === user.username)) return false;
        users.push(user);
        localStorage.setItem('cm_user', JSON.stringify(users));
        return true;
    }

    updateUser(username: string, updates: Partial<Pick<AppUser, 'password' | 'role'>>): boolean {
        const users = this.getUsers();
        const index = users.findIndex(u => u.username === username);
        if (index === -1) return false;
        users[index] = { ...users[index], ...updates };
        localStorage.setItem('cm_user', JSON.stringify(users));
        return true;
    }

    deleteUser(username: string): boolean {
        if (this.PROTECTED.includes(username)) return false;
        const users = this.getUsers().filter(u => u.username !== username);
        localStorage.setItem('cm_user', JSON.stringify(users));
        return true;
    }

    isProtected(username: string): boolean {
        return this.PROTECTED.includes(username);
    }
}
