import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Store } from '@ngrx/store';

import * as fromApp from '../store/app.reducer';
import { exhaustMap, take } from 'rxjs/operators';
import { Injectable } from '@angular/core';




@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private store: Store<fromApp.AppState>) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.store.select('auth').pipe(
      take(1),
      exhaustMap(authState => {
        const token = authState.token;
        const authReq = this.addTokenToReq(req, token);
        return next.handle(authReq);
      })
    );
  }

  private addTokenToReq(req: HttpRequest<any>, token) {
    return req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token)
    });
  }
}


































