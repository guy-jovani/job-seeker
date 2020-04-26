import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';

import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor(private store: Store<fromApp.AppState>,
              private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, router: RouterStateSnapshot):
    boolean | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> | UrlTree {
      return this.store.select('user')
        .pipe(
          take(1),
          map(userState => {
            const isAuth = !!userState.user;
            if (isAuth) {
              return true;
            } else {
              this.store.dispatch(new AuthActions.AuthFailure(['You need to log in for that.']));
              return this.router.createUrlTree(['/login']);
            }
          })
        );
    }
}


















