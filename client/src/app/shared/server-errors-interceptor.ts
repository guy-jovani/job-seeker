import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { catchError, switchMap, filter, take, exhaustMap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Store } from '@ngrx/store';

import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import { AuthAutoLogoutService } from 'app/auth/auth-auto-logout.service';

const nodeServer = environment.nodeServer + 'auth/';

@Injectable()
export class ServerErrorsInterceptor implements HttpInterceptor {


  private isRefreshing = false;
  private refresherTokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(private store: Store<fromApp.AppState>,
              private http: HttpClient,
              private authAutoLogoutService: AuthAutoLogoutService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.store.select('auth').pipe(
      take(1),
      exhaustMap(authState => {
        return next.handle(req).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && error.error['type'] === 'TokenExpiredError' ) { // JWT expired
              return this.handleJWTExpiration(authState.refreshToken, req, next);
            }
            return throwError(error['error']['messages']);
          })
        );
      })
    );
  }

  private handleJWTExpiration(refreshToken: string, req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refresherTokenSubject.next(null);

      this.store.dispatch(new AuthActions.RefreshTokenAttempt());
      return this.http.post(nodeServer + 'refreshToken', { refreshToken })
        .pipe(
          switchMap((res: { newAccessToken: string, expiresInSeconds: number }) => {
            this.isRefreshing = false;
            this.authAutoLogoutService.autoLogout(res.expiresInSeconds * 1000);
            this.store.dispatch(new AuthActions.AuthSuccess({
              redirect: false,
              token: res.newAccessToken,
              expiresInSeconds: res.expiresInSeconds
            }));
            this.refresherTokenSubject.next(res.newAccessToken);
            return next.handle(this.addTokenToReq(req, res.newAccessToken));
          }),
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && error.error['type'] === 'TokenRefreshError' ) { // JWT expired
              return throwError('There was an unexpected error. Please log in again.');
            }
            return throwError(error['error']['messages']);
          })
        );
    } else {
      return this.refresherTokenSubject.pipe(
        filter(token => token != null), // waiting until the new access token will be fetched
        take(1),
        switchMap(token => {
          return next.handle(this.addTokenToReq(req, token));
        })
      );
    }
  }

  private addTokenToReq(req: HttpRequest<any>, token) {
    return req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token)
    });
  }

}


