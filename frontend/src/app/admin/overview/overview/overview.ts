import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-overview',
  imports: [CommonModule, RouterLink],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview implements OnInit {
  stats = signal<any>(null);
  recentOrders = signal<any[]>([]);
  isLoading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentOrders();
  }

  loadStats(): void {
    this.http
      .get<any>('http://localhost:5000/api/orders/stats', {
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          this.stats.set(res.stats);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  loadRecentOrders(): void {
    this.http
      .get<any>('http://localhost:5000/api/orders?limit=5', {
        withCredentials: true,
      })
      .subscribe({
        next: (res) => this.recentOrders.set(res.orders ?? []),
      });
  }

  currency(n: number): string {
    return `R ${Number(n ?? 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  label(s: string): string {
    return s?.replace(/_/g, ' ') ?? '';
  }

  date(d: string): string {
    return new Date(d).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
