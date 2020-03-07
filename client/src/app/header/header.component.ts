import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';


import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import * as EmployeeActions from '../employees/store/employee.actions';
import * as CompanyActions from '../company/store/company.actions';
import * as PositionActions from '../position/store/position.actions';
import { Employee } from '../employees/employee.model';
import { Company } from 'app/company/company.model';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  collapsed = true;
  isAuthenticated = false;
  checkAuthSub: Subscription;
  user: Employee | Company = null;
  chatNotifications = false;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.checkAuthSub = this.store.select('auth')
      .subscribe(authState => {
        this.isAuthenticated = !!authState.user;
        if (this.isAuthenticated) {
          this.user = authState.user;
        }
        this.chatNotifications = !!authState.notificatios.find(notification => notification === 'chat');
      });
  }

  onLogout() {
    this.store.dispatch(new EmployeeActions.Logout());
    this.store.dispatch(new CompanyActions.Logout());
    this.store.dispatch(new AuthActions.Logout());
    this.store.dispatch(new PositionActions.Logout());
  }

  onFetchEmployees() {
    this.store.dispatch(new EmployeeActions.FetchAllEmployees());
  }

  onFetchCompanies() {
    this.store.dispatch(new CompanyActions.FetchAllCompanies());
  }

  onFetchPositions() {
    this.store.dispatch(new PositionActions.FetchAllPositions());
  }

  ngOnDestroy() {
    if (this.checkAuthSub) {
      this.checkAuthSub.unsubscribe();
    }
  }

}
