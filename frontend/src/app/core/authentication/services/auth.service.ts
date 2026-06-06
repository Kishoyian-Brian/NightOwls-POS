import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
export interface AppUser{
    username: string;
    password: string;
    role: 'waiter' | 'manager' | 'bar'|'kitchen';
}

@Injectable({
  providedIn: 'root'
})

export class AuthService{
    private readonly USER_KEY = 'cm_user';
    private readonly SESSION_KEY = 'cm_session';

    constructor(private router: Router){
        this.seedUsers();
    }

    private seedUsers(){
        if(!localStorage.getItem(this.USER_KEY)){
            const users: AppUser[] = [
                {username: 'waiter', password: 'waiter', role: 'waiter'},
                {username: 'manager', password: 'manager', role: 'manager'},
                {username: 'bar', password: 'bar', role: 'bar'},
                {username: 'kitchen', password: 'kitchen', role: 'kitchen'},
            ];
            localStorage.setItem(this.USER_KEY, JSON.stringify(users));
        }
    }
    
    login(username:string, password:string): boolean{
        const users:AppUser[] = JSON.parse(localStorage.getItem(this.USER_KEY) || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        if(user){
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
            return true;
        }
        return false;
    }
    logout(): void{
        localStorage.removeItem(this.SESSION_KEY);
        this.router.navigate(['/login']);
    }
    getCurrentUser(): AppUser | null{
        const session = localStorage.getItem(this.SESSION_KEY);
        return session ? JSON.parse(session) : null;
    }
    isLoggedIn(): boolean{
        return !!localStorage.getItem(this.SESSION_KEY);
    }
    resetPassword(username:string, newPassword:string): boolean{
        const users:AppUser[] = JSON.parse(localStorage.getItem(this.USER_KEY) || '[]');
        const index = users.findIndex(u=>u.username === username);
        if(index === -1){
            return false;   
        }
        users[index].password = newPassword;
        localStorage.setItem(this.USER_KEY, JSON.stringify(users));
        return true;
    }
}