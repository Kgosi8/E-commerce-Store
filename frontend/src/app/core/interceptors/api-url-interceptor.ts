import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';


export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if(environment.production && req.url.startsWith('http://localhost:5000')) {
    return next(req.clone({ url: req.url.replace('http://localhost:5000', '') }));
  }
  return next(req);
};
