import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import * as fromApp from '../../store/app.reducer';
import { Employee } from '../employee.model';
import * as EmployeeActions from '../store/employee.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-employee',
  templateUrl: './list-employee.component.html',
  styleUrls: ['./list-employee.component.scss']
})
export class ListEmployeeComponent implements OnInit, OnDestroy {

  employees: Employee[];
  subscription: Subscription;
  isLoading = false;
  errorMessages: string[] = [];
  currUrl: string[] = null;

  constructor(private store: Store<fromApp.AppState>,
              private router: Router) { }

  ngOnInit() {

    this.subscription = this.store.select('employee')
      .subscribe(employeeState => {
        this.currUrl = this.router.url.substring(1).split('/');
        this.isLoading = employeeState.loadingAll;
        console.log(employeeState)
        if (this.currUrl[this.currUrl.length - 1] === 'employees') {
          if (employeeState.messages) {
            this.errorMessages = [];
            for (const msg of employeeState.messages) {
              this.errorMessages.push(msg);
            }
          } else {
            this.errorMessages = [];
          }
        }
        this.employees = employeeState.employees;
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
