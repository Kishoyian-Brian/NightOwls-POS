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
  {
    path: 'kitchen',
    loadComponent: () =>
      import('./features/kitchen/pages/kitchen-dashboard.component').then(
        (m) => m.KitchenDashboardComponent,
      ),
  },
  {
    path: 'bar',
    loadComponent: () =>
      import('./features/bar/pages/bar-dashboard.component').then(
        (m) => m.BarDashboardComponent,
      ),
  },
];
