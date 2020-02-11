import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

import { Subscription } from 'rxjs';
import { Company } from 'app/company/company.model';
import * as fromApp from '../../store/app.reducer';
import { Employee } from '../employee.model';
import * as EmployeeActions from '../store/employee.actions';

@Component({
  selector: 'app-details-employee',
  templateUrl: './details-employee.component.html',
  styleUrls: ['./details-employee.component.css']
})
export class DetailsEmployeeComponent implements OnInit, OnDestroy {
  index: number;
  employee: Employee;
  storeSub: Subscription;
  routeSub: Subscription;
  allowEdit: boolean; // only allow to edit if the current employee is the one logged in
  companies: Company[];
  isLoading = false;
  errorMessages = [];

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.routeSub = this.route.params
      .pipe(
        map((params: Params) => {
          this.index = +params['index'];
        }),
        switchMap(() => {
          return this.store.select('employee');
        }),
        switchMap(employeeState => {
          this.isLoading = employeeState.loadingSingle;
          if (this.index && (this.index >= employeeState.employees.length || this.index < 0)) {
            // check if trying to get details of an undefined employee
            this.router.navigate(['employees']);
          }
          if (this.index >= 0) {
            this.employee = employeeState.employees[this.index];
            this.allowEdit = false;
          }
          return this.store.select('auth');
        })
      )
      .subscribe(authState => {
        if ( isNaN(this.index)) {
          this.employee = authState.user as Employee;
          this.allowEdit = true;
        }
      });
  }


  ngOnDestroy() {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
