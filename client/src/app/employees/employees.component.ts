import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Employee } from './employee.model';
import { ApplicantPosition, Company } from 'app/company/company.model';

import * as fromApp from '../store/app.reducer';
import * as EmployeeActions from './store/employee.actions';

@Component({
  selector: 'app-empolyees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, OnDestroy {
  employees: Employee[] | { positions: ApplicantPosition[], employee: Employee }[];
  subscription: Subscription;
  isLoading = false;
  applicantsList = false;
  messages: string[] = [];
  currUrl: string[] = null;

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.subscription = this.route.params.pipe(
      switchMap(() => {
        this.currUrl = this.router.url.substring(1).split('/');
        if (this.currUrl[0] === 'my-applicants') {
          return this.store.select('user');
        } else {
          return this.store.select('employee');
        }
      })
      ).subscribe(currState => {
        this.currUrl = this.router.url.substring(1).split('/');
        if (currState.messages) {
          this.messages = [];
          for (const msg of currState.messages) {
            this.messages.push(msg);
          }
        } else {
          this.messages = [];
        }
        if (this.currUrl[0] === 'my-applicants') {
          this.isLoading = currState['loading'];
          this.applicantsList = true;
          this.employees = currState['user'] ? currState['user'].applicants : null;

        } else {
          this.isLoading = currState['loadingAll'];
          this.employees = currState['employees'];
        }
      });
  }

  onClose() {
    this.store.dispatch(new EmployeeActions.ClearError());
    }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.onClose();
  }

}
