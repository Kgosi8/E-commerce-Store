import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth/auth-service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatIconModule,CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  initials$!: Observable<string | null>;
  isLoggedIn$!: Observable<boolean>;
  

  constructor(private authService: AuthService, private cd:ChangeDetectorRef) {
    this.initials$=this.authService.initials$;
    this.isLoggedIn$=this.authService.isLoggedIn$;
  }
}
  

  // ngOnInit(): void {

    
  //   // Subscribe to initials observable
  //   this.authService.initials$.subscribe((initials) => {
  //     this.initials = initials;
  //     this.cd.detectChanges();
  //   });

  //   // Load user when app starts or refreshes
  //   this.authService.isLoggedIn$.subscribe((status) => {
  //     this.isLoggedIn = status;
  //     this.cd.detectChanges();
  //   });
  // }

