import { Routes } from '@angular/router';
import { roleGuard } from './core/authentication/guards/role.guard';

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
    canActivate: [roleGuard(['waiter'])],
    loadComponent: () =>
      import('./features/waiter/pages/waiter-dashboard.component').then(
        (m) => m.WaiterDashboardComponent,
      ),
  },
  {
    path: 'kitchen',
    canActivate: [roleGuard(['kitchen'])],
    loadComponent: () =>
      import('./features/kitchen/pages/kitchen-dashboard.component').then(
        (m) => m.KitchenDashboardComponent,
      ),
  },
  {
    path: 'bar',
    canActivate: [roleGuard(['bar'])],
    loadComponent: () =>
      import('./features/bar/pages/bar-dashboard.component').then(
        (m) => m.BarDashboardComponent,
      ),
  },
  {
    path: 'store',
    canActivate: [roleGuard(['store'])],
    loadComponent: () =>
      import('./features/store/pages/store-dashboard.component').then(
        (m) => m.StoreDashboardComponent,
      ),
  },
  {
    path: 'manager',
    canActivate: [roleGuard(['manager'])],
    loadComponent: () =>
      import('./features/manager/pages/manager-shell.component').then(
        (m) => m.ManagerShellComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/manager/pages/manager-overview.component').then(
            (m) => m.ManagerOverviewComponent,
          ),
      },
      {
        path: 'tables',
        loadComponent: () =>
          import('./features/tables/pages/tables-page.component').then(
            (m) => m.TablesPageComponent,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/pages/products-page.component').then(
            (m) => m.ProductsPageComponent,
          ),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/inventory/pages/inventory-page.component').then(
            (m) => m.InventoryPageComponent,
          ),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/payments/pages/payments-page.component').then(
            (m) => m.PaymentsPageComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/pages/reports-page.component').then(
            (m) => m.ReportsPageComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/pages/users-page.component').then(
            (m) => m.UsersPageComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/pages/settings-page.component').then(
            (m) => m.SettingsPageComponent,
          ),
      },
    ],
  },
];
