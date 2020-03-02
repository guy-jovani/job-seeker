import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import * as fromApp from '../store/app.reducer';
import * as EmployeeActions from './store/employee.actions';

@Component({
  selector: 'app-empolyees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, OnDestroy {
  storeSubscription: Subscription;
  errorMessages: string[] = [];

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit(){
    this.storeSubscription = this.store.select('employee')
      .subscribe(
        employeeState => {
          if(employeeState.messages){
            for(let msg of employeeState.messages){
              this.errorMessages.push(msg)
            }
          } else {
            this.errorMessages = [];
          }
        }
      );
  }

  ngOnDestroy(){
    if(this.storeSubscription){
      this.storeSubscription.unsubscribe();
    }
  }

  onClose(){
    this.store.dispatch(new EmployeeActions.ClearError());
  }
}
