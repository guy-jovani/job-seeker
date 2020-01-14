import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromApp from '../../store/app.reducer';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DetailsEmployeeGuard implements CanActivate {

  constructor(private store: Store<fromApp.AppState>, 
              private router: Router){}
    
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): 
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.store.select('employee').pipe(
        take(1),
        map(employeeState => {
          const re = /\d+/;
          const index = re.exec(next.url[0].path);
          if(!index  || !index[0]){ // || +index >= employeeState.employees.length
            return this.router.createUrlTree(['/employees']);
          } else {
            return true;
          }
        })
      );
  }
  
}
