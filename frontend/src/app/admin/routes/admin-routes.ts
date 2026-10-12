import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../layout/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('../overview/overview/overview').then(m => m.Overview),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('../../components/pages/admin-orders/admin-orders').then(m => m.AdminOrders),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('../products/product-list/product-list')
            .then(m => m.ProductList),
      },
      {
        path: 'products/add',
        loadComponent: () =>
          import('../../components/pages/admin-dashboard/admin-dashboard')
            .then(m => m.AdminDashboard),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('../customers/customers/customers').then(m => m.Customers),
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('../sales/sales/sales').then(m => m.Sales),
      },
    ],
  },
];