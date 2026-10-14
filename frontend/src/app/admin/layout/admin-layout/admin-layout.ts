import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';




@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule,RouterOutlet, RouterModule,RouterLink,RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {

 sidebarOpen = signal(true);

  navItems = [
    { label: 'Overview',  path: 'overview',  icon: 'grid'     },
    { label: 'Orders',    path: 'orders',    icon: 'shopping' },
    { label: 'Products',  path: 'products',  icon: 'box'      },
    { label: 'Customers', path: 'customers', icon: 'users'    },
    { label: 'Sales',     path: 'sales',     icon: 'bar'      },
  ];

  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  goToStore(): void {
    this.router.navigate(['/']);
  }

}
