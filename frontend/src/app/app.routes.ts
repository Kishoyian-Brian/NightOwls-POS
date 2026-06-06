import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/pages/landing-page.component').then(
        (m) => m.LandingPageComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/pages/forgot-passwprd.component').then(
        (m) => m.ForgotPasswordComponet,
      ),
  },
  {
    path: 'waiter',
    loadComponent: () =>
      import('./features/waiter/pages/waiter-dashboard.component').then(
        (m) => m.WaiterDashboardComponent,
      ),
  },
];
