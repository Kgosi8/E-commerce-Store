import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-sales',
  imports: [CommonModule],
  templateUrl: './sales.html',
  styleUrl: './sales.css',
})
export class Sales implements OnInit {
  stats = signal<any>(null);
  isLoading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
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

  formatCurrency(n: number): string {
    return `R ${Number(n ?? 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  entries(obj: any): { key: string; value: number }[] {
    if (!obj) return [];
    return Object.entries(obj).map(([key, value]) => ({
      key,
      value: value as number,
    }));
  }

  statusLabel(s: string): string {
    return s.replace(/_/g, ' ');
  }
}
