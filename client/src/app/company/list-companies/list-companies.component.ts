import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import * as fromApp from '../../store/app.reducer';
import { Company } from '../company.model';
import { Employee } from 'app/employees/employee.model';
import * as CompanyActions from '../store/company.actions';

@Component({
  selector: 'app-list-companies',
  templateUrl: './list-companies.component.html',
  styleUrls: ['./list-companies.component.css']
})
export class ListCompaniesComponent implements OnInit {
  companies: Company[];
  subscription: Subscription;
  activeEmployee: Employee;
  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute) { }
              

  ngOnInit() {
    this.subscription = this.store.select('company')
      .pipe(map(companieState => companieState.companies))
      .subscribe(companies => {
        this.companies = companies;
      });
    // this.subscription = this.store.select('auth')
    //   .pipe(
    //     switchMap(authState => {
    //       if(this.route.url['_value'][0].path === 'my-details'){
    //         this.activeEmployee = authState.employee;
    //       }
    //       return this.store.select('company');
    //     }),
    //     map(companieState => companieState.companies)
    //   )
    //   .subscribe(companies => {
    //     if(this.activeEmployee){
    //       this.companies = companies.filter(company => company.creatorId === this.activeEmployee._id);
    //     } else{
    //       this.companies = companies;
    //     }
    //   });
  }

  getCompanyinfo(index: number){
    this.store.dispatch(new CompanyActions.FetchSingleCompany(this.companies[index]._id));
  }

  ngOnDestroy(){
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }
}
