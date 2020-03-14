import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import * as fromApp from '../../store/app.reducer';
import { Employee } from '../employee.model';
import * as EmployeeActions from '../store/employee.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Company, ApplicantPosition } from 'app/company/company.model';

@Component({
  selector: 'app-list-employee',
  templateUrl: './list-employee.component.html',
  styleUrls: ['./list-employee.component.scss']
})
export class ListEmployeeComponent implements OnInit, OnDestroy {
  employees: Employee[] | { positions: ApplicantPosition[], employee: Employee }[];
  subscription: Subscription;
  isLoading = false;
  messages: string[] = [];
  currUrl: string[] = null;
  user: Company = null; // only used on /my-applicants

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
          this.user = currState['user'];
          this.isLoading = currState['loading'];
          this.employees = this.user.applicants;
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




