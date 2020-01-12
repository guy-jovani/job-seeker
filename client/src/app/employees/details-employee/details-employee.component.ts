import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

import * as fromApp from '../../store/app.reducer';
import { Employee } from '../employee.model';
import { Subscription } from 'rxjs';
import { Company } from 'app/company/company.model';

@Component({
  selector: 'app-details-employee',
  templateUrl: './details-employee.component.html',
  styleUrls: ['./details-employee.component.css']
})
export class DetailsEmployeeComponent implements OnInit, OnDestroy {
  index: number;
  employee: Employee;
  storeSub: Subscription;
  allowEdit: boolean; // only allow to edit if the current employee is the one logged in
  companies: Company[];

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.route.params
      .pipe(
        map((params: Params) => {
          this.index = +params['index'];
        }),
        switchMap(() => {
          return this.store.select('employee');
        }),
        switchMap(employees => {          
          if(this.index >= 0){
            this.employee = employees.employees[this.index];
            this.allowEdit = false;
          }          
          return this.store.select('auth');
        }),
        switchMap(authState => {
          if(!this.employee || (authState.employee && this.employee._id === authState.employee._id)){
            this.employee = authState.employee;
            this.allowEdit = true;
          }
          return this.store.select('company');
        })
      )     
      .subscribe(companyState => {  
        this.companies = 
          companyState.companies.filter(company => company.creatorId === this.employee._id);
      });
  }


  ngOnDestroy(){
    if(this.storeSub){
      this.storeSub.unsubscribe();
    }
  }
}
