import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import * as fromApp from '../../store/app.reducer';

import * as CompanyActions from '../../company/store/company.actions';
import * as EmployeeActions from '../../employees/store/employee.actions';




@Component({
  selector: 'app-details-user',
  templateUrl: './details-user.component.html',
  styleUrls: ['./details-user.component.scss']
})
export class DetailsUserComponent implements OnInit, OnDestroy {
  userEmployee: boolean;
  authSubscription: Subscription;
  companySubscription: Subscription;
  employeeSubscription: Subscription;
  errorMessages: string[] = [];
  employeeErrors = false;
  companyErrors = false;

  constructor(private store: Store<fromApp.AppState>) { }

  getErrorMessages = (messages: string[]) => {
    this.errorMessages = [];
    if (messages) {
      for (const msg of messages) {
        this.errorMessages.push(msg);
      }
      return true;
    }
    return false;
  }

  ngOnInit() {
    this.authSubscription = this.store.select('auth').subscribe(authState => {
      this.userEmployee = authState.kind === 'employee';
    });

    this.authSubscription = this.store.select('company').subscribe(companyState => {
      this.companyErrors = this.getErrorMessages(companyState.messages);
    });

    this.employeeSubscription = this.store.select('employee').subscribe(employeeState => {
      this.employeeErrors = this.getErrorMessages(employeeState.messages);
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.companySubscription) {
      this.companySubscription.unsubscribe();
    }
    if (this.employeeSubscription) {
      this.employeeSubscription.unsubscribe();
    }
  }

  onClose() {
    if (this.employeeErrors) { this.store.dispatch(new EmployeeActions.ClearError()); }
    if (this.companyErrors) { this.store.dispatch(new CompanyActions.ClearError()); }
  }
}
