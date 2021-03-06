import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import * as EmployeeActions from '../employees/store/employee.actions';
import * as CompanyActions from '../company/store/company.actions';
import * as JobActions from '../job/store/job.actions';
import * as UserActions from '../user/store/user.actions';
import { Employee } from '../employees/employee.model';
import { Company } from 'app/company/company.model';
import { Router, NavigationStart } from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  collapsed = true;
  isAuthenticated = false;
  subscription: Subscription;
  routerSub: Subscription;
  user: Employee | Company = null;
  chatNotifications = false;
  kind: string;
  production = environment.production;

  constructor(private store: Store<fromApp.AppState>,
              private router: Router) { }

  ngOnInit() {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(routerObj => {
      this.collapsed = true;
    });

    this.subscription = this.store.select('user')
      .subscribe(userState => {
        this.isAuthenticated = !!userState.user;
        if (this.isAuthenticated) {
          this.user = userState.user;
          this.kind = userState.kind;
        }
        this.chatNotifications = !!userState.notifications.find(notification => notification === 'chat');
      });
  }

  onLogout() {
    this.store.dispatch(new AuthActions.Logout());
  }

  onFetchEmployees() {
    this.store.dispatch(new EmployeeActions.FetchEmployees());
  }

  onFetchConversations() {
    this.store.dispatch(new UserActions.FetchAllConversations());
  }

  onFetchCompanies() {
    this.store.dispatch(new CompanyActions.FetchCompanies());
  }

  onFetchJobs() {
    this.store.dispatch(new JobActions.FetchJobs());
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

}
