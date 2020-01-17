import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import * as fromApp from '../../store/app.reducer';
import { Employee } from '../employee.model';
import * as EmployeeActions from '../store/employee.actions';

@Component({
  selector: 'app-list-employee',
  templateUrl: './list-employee.component.html',
  styleUrls: ['./list-employee.component.css']
})
export class ListEmployeeComponent implements OnInit, OnDestroy {

  employees: Employee[];
  subscription: Subscription;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.subscription = this.store.select('employee')
      .pipe(
        map(employeeState => employeeState.employees )
      )
      .subscribe(employees => {
        this.employees = employees;
      });
  }

  getEmployeeinfo(index: number){
    this.store.dispatch(new EmployeeActions.FetchSingleEmployee(this.employees[index]._id));
  }

  ngOnDestroy(){
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

}
