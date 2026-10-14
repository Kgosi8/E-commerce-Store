import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
}

@Component({
  selector: 'app-customers',
  imports: [CommonModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  customers = signal<Customer[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<any>('http://localhost:5000/api/orders/customers', {
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          this.customers.set(res.customers);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Failed to load customers.');
          this.isLoading.set(false);
        },
      });
  }

  currency(n: number): string {
    return `R ${Number(n ?? 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  date(d: string): string {
    return new Date(d).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
