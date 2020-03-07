import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { Subscription } from 'rxjs';
import * as fromApp from '../../store/app.reducer';
import { Employee } from '../employee.model';
import * as EmployeeActions from '../store/employee.actions';

@Component({
  selector: 'app-details-employee',
  templateUrl: './details-employee.component.html',
  styleUrls: ['./details-employee.component.scss']
})
export class DetailsEmployeeComponent implements OnInit, OnDestroy {
  employee: Employee;
  routeSub: Subscription;
  allowEdit: boolean;
  isLoading = false;
  errorMessages: string[] = [];

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    let currUrl;
    this.routeSub = this.route.params
      .pipe(
        switchMap(() => {
          currUrl = this.router.url.substring(1).split('/');
          if (currUrl[0] === 'my-details') {
            return this.store.select('auth');
          } else {
            return this.store.select('employee');
          }
        }))
        .subscribe(currState => {
          currUrl = this.router.url.substring(1).split('/');
          if (currUrl[0] === 'my-details') {
            this.employee = currState['user'] as Employee;
            this.allowEdit = true;
          } else { // employee list details
            if (currUrl[1] >= currState['employees'].length || currUrl[1] < 0) {
              // check if trying to get details of an undefined employee
              return this.router.navigate(['employees']);
            }
            this.isLoading = currState['loadingSingle'];
            if (currUrl[currUrl.length - 1] === 'employee') {
              if (currState.messages) {
                this.errorMessages = [];
                for (const msg of currState.messages) {
                  this.errorMessages.push(msg);
                }
              } else {
                this.errorMessages = [];
              }
            }
            this.employee = currState['employees'][+currUrl[1]];
            this.allowEdit = false;
          }
        });
  }

  onClose() {
    this.store.dispatch(new EmployeeActions.ClearError());
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    this.onClose();
  }
}
