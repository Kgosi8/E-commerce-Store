import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = 'http://localhost:5000/api';
  private initialsSubject = new BehaviorSubject<string | null>(null);
  initials$ = this.initialsSubject.asObservable();
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$=this.loggedInSubject.asObservable();

  setInitials(initials: string) {
    this.initialsSubject.next(initials);
    this.loggedInSubject.next(true);
  }

  clearInitials() {
    this.initialsSubject.next(null);
  }

  clearAuth() {
    this.initialsSubject.next(null);
    this.loggedInSubject.next(false);
  }

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user);
  }

  login(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, user, { withCredentials: true });
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user`, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, { withCredentials: true });
  }

  loadUser() {
    this.getUserProfile().subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.initialsSubject.next(res.data.initials);
          this.loggedInSubject.next(true);
        }
      },
      error: () => {
        this.clearAuth();
      },
    });
  }
}
