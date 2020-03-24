import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import { map, take } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class NotLoggedGuard implements CanActivate {

  constructor(private store: Store<fromApp.AppState>,
              private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.store.select('user')
      .pipe(
        take(1),
        map(userState => {
          const isAuth = !userState.user;
          if (isAuth) {
            return true;
          } else {
            return this.router.createUrlTree(['/']);
          }
        })
      );
  }

}
