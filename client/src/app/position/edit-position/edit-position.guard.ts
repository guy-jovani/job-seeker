import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';



import * as fromApp from '../../store/app.reducer';
import { Store } from '@ngrx/store';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EditPositionGuard implements CanActivate {

  constructor(private store: Store<fromApp.AppState>,
              private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.store.select('user').pipe(
        take(1),
        map(userState => {
          console.log(userState)
          if (userState.kind === 'company') {
            return true;
          }
          return this.router.createUrlTree([state.url.split('/')[1]]);
        })
    );
  }

}
