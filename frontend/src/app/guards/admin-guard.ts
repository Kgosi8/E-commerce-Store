import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';
import { filter, map, take } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  
  const router = inject(Router);

  const authService= inject(AuthService);

  return authService.role$.pipe(
    filter(role => role !== null), // wait until role is loaded
    take(1), // only take the first value
    map((role)=>{
      if(role === 'admin'){
        return true;
      }
      router.navigate(['/']);
      return false;
    })
  )

};
