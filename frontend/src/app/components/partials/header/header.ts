import { Component, NgZone } from '@angular/core';
import { RouterLink } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  initials: string | null = null;
  private baseUrl = 'http://localhost:5000/api/user';

  constructor(private http: HttpClient, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.http.get<{ status: string; data: any }>(this.baseUrl, { withCredentials: true })
      .subscribe({
        next: (res) => {
          if (res.status === 'success' && res.data) {
            // Ensure Angular detects change safely
            this.ngZone.run(() => {
              this.initials = res.data.initials || null;
            });
          }
        },
        error: (err) => {
          console.error('Error fetching user profile:', err);
          this.initials = null;
        }
      });
  }
}

