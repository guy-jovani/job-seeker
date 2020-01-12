import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromApp from '../store/app.reducer';
// import * as EmployeeActions from './store/employee.actions';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {
  storeSubscription: Subscription;
  errorMessages: string[] = [];

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit(){
    this.storeSubscription = this.store.select('employee')
      .subscribe(
        // employeeState => {
        //   if(employeeState.messages){
        //     for(let msg of employeeState.messages){
        //       this.errorMessages.push(msg)
        //     }
        //   } else {
        //     this.errorMessages = [];
        //   }
        // }
      );
  }

  ngOnDestroy(){
    if(this.storeSubscription){
      this.storeSubscription.unsubscribe();
    }
  }

  onClose(){
    // this.store.dispatch(new EmployeeActions.ClearError());
  }
}
