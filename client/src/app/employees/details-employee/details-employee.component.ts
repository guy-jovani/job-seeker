import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

import { Subscription } from 'rxjs';
import { Company } from 'app/company/company.model';
import * as fromApp from '../../store/app.reducer';
import { Employee } from '../employee.model';

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

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    let currUrl;
    this.routeSub = this.route.params
      .pipe(
        switchMap(() => {
          currUrl = this.route.snapshot['_routerState'].url.substring(1).split('/');
          if (currUrl[0] === 'my-details') {
            return this.store.select('auth');
          } else {
            return this.store.select('employee');
          }
        }))
        .subscribe(currState => {
          if (currUrl[0] === 'my-details') {
            this.employee = currState['user'] as Employee;
            this.allowEdit = true;
          } else { // employee list details
            this.isLoading = currState['loadingSingle'];
            if (currUrl[1] >= currState['employees'].length || currUrl[1] < 0) {
              // check if trying to get details of an undefined employee
              return this.router.navigate(['employees']);
            }
            this.employee = currState['employees'][+currUrl[1]];
            this.allowEdit = false;
          }
        });
  }


  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
