import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';


import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import * as EmployeeActions from '../employees/store/employee.actions';
import * as CompanyActions from '../company/store/company.actions';
import { Employee } from '../employees/employee.model';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  collapsed = true;
  isAuthenticated = false;
  checkAuthSub: Subscription;
  loggedEmployeeInd: Employee = null;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.checkAuthSub = this.store.select('auth').pipe(
      map(authState => {
        return authState.employee;
      })).subscribe(employee => {
        this.isAuthenticated = !!employee;
        if(this.isAuthenticated){
          this.loggedEmployeeInd;
        }
      });
  }

  onLogout(){
    this.store.dispatch(new AuthActions.Logout());
  }

  onFetchEmployees(){
    this.store.dispatch(new EmployeeActions.FetchAllEmployees());
  }

  onFetchCompanies(){
    this.store.dispatch(new CompanyActions.FetchAllCompanies());
  }

  ngOnDestroy(){
    if(this.checkAuthSub){
      this.checkAuthSub.unsubscribe();
    }
  }

}
