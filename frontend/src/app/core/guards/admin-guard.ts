import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../../services/account/account-service';
import { catchError, map, of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  return accountService.getUser().pipe(
    map((res) => (res.data.role === 'admin' ? true : router.createUrlTree(['/']))),
    catchError((err) => of(router.createUrlTree([err.status === 401 ? '/login' : '/']))),
  );
};
