import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';



interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {

  sidebarOpen = signal(true);
  currentPath = signal('');

  navItems: NavItem[] = [
    { label: 'Overview', path: '/admin/overview', icon: 'overview' },
    { label: 'Orders', path: '/admin/orders', icon: 'orders' },
    { label: 'Products', path: '/admin/products', icon: 'products' },
    { label: 'Add Product', path: '/admin/products/add', icon: 'add' },
    { label: 'Customers', path: '/admin/customers', icon: 'customers' },
    { label: 'Sales', path: '/admin/sales', icon: 'sales' },
  ];


  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.currentPath.set(e.urlAfterRedirects));
  }


  isActive(path: string): boolean{
    return this.currentPath().startsWith(path);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v=> !v);
  }

  goToStore(): void{
    this.router.navigate(['/']);
  }

}
