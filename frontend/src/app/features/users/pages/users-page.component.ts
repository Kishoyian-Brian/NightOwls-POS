import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppUser,
  LoginRole,
  StaffRole,
  STAFF_ROLE_LABELS,
  isLoginRole,
  LOGIN_ROLES,
  RECORD_ONLY_ROLES,
} from '../../../core/authentication/models/user.model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-page.component.html',
})
export class UsersPageComponent implements OnInit {
  users: AppUser[] = [];
  showForm = false;
  form: AppUser = { username: '', password: '', role: 'waiter' };
  error = '';
  roleFilter: 'all' | StaffRole = 'all';

  /** Login-capable roles a manager may create (not manager — single admin account) */
  addLoginRoles: LoginRole[] = ['waiter', 'bar', 'kitchen'];

  viewRoles: StaffRole[] = [...LOGIN_ROLES, ...RECORD_ONLY_ROLES];

  loginRoles = LOGIN_ROLES;
  recordOnlyRoles = RECORD_ONLY_ROLES;

  constructor(public userService: UserService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.users = this.userService.getUsers();
  }

  get filteredUsers(): AppUser[] {
    if (this.roleFilter === 'all') return this.users;
    return this.users.filter(u => u.role === this.roleFilter);
  }

  get recordOnlyCount(): number {
    return this.users.filter(u => !isLoginRole(u.role)).length;
  }

  countByRole(role: StaffRole): number {
    return this.users.filter(u => u.role === role).length;
  }

  setFilter(role: 'all' | StaffRole): void {
    this.roleFilter = role;
  }

  roleLabel(role: StaffRole): string {
    return STAFF_ROLE_LABELS[role] ?? role;
  }

  canSignIn(role: StaffRole): boolean {
    return isLoginRole(role);
  }

  roleHint(role: StaffRole): string {
    switch (role) {
      case 'kitchen':
        return 'Receives food orders from waiters at the kitchen station.';
      case 'cook':
        return 'Prepares food in the kitchen — employee record only.';
      case 'bouncer':
        return 'Door and crowd control — employee record only.';
      case 'security':
        return 'Venue security — employee record only.';
      case 'janitor':
        return 'Cleaning and maintenance — employee record only.';
      default:
        return '';
    }
  }

  openAdd(): void {
    this.form = { username: '', password: '', role: 'waiter' };
    this.showForm = true;
    this.error = '';
  }

  save(): void {
    this.error = '';
    if (!this.form.username.trim()) {
      this.error = 'Name is required.';
      return;
    }
    if (isLoginRole(this.form.role) && !this.form.password) {
      this.error = 'Password is required for staff who can sign in.';
      return;
    }
    const user: AppUser = {
      ...this.form,
      username: this.form.username.trim(),
      password: this.form.password || '—',
    };
    if (!this.userService.addUser(user)) {
      this.error = 'That name is already on the list.';
      return;
    }
    this.showForm = false;
    this.load();
  }

  deleteUser(user: AppUser): void {
    if (this.userService.isProtected(user.username)) {
      alert('Cannot delete default system accounts.');
      return;
    }
    if (!confirm(`Remove employee "${user.username}"?`)) return;
    this.userService.deleteUser(user.username);
    this.load();
  }

  resetPassword(user: AppUser): void {
    if (!isLoginRole(user.role)) {
      alert(`${this.roleLabel(user.role)} staff do not sign in — no password needed.`);
      return;
    }
    const pwd = prompt(`New password for ${user.username}:`);
    if (!pwd) return;
    this.userService.updateUser(user.username, { password: pwd });
    alert('Password updated.');
  }

  cancel(): void {
    this.showForm = false;
  }
}
