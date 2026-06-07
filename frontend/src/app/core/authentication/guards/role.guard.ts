import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRole } from '../models/user.model';

export function roleGuard(roles: LoginRole[]): CanActivateFn {
    return () => {
        const auth = inject(AuthService);
        const router = inject(Router);
        const user = auth.getCurrentUser();
        if (user && roles.includes(user.role as LoginRole)) return true;
        router.navigate(['/login']);
        return false;
    };
}
