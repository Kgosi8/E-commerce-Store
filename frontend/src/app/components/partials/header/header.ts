import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
  

  constructor(private authService: AuthService, private cd:ChangeDetectorRef, private router: Router) {
    this.initials$=this.authService.initials$;
    this.isLoggedIn$=this.authService.isLoggedIn$;
  }

  goTohomePage(){
    this.router.navigate(['/']);
  }

  goTocartPage(){
    this.router.navigate(['/cart']);
  }
}
  
