import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import * as fromApp from '../../store/app.reducer';
import { Company } from '../company.model';
import { Employee } from 'app/employees/employee.model';
import * as CompanyActions from '../store/company.actions';

@Component({
  selector: 'app-list-companies',
  templateUrl: './list-companies.component.html',
  styleUrls: ['./list-companies.component.scss']
})
export class ListCompaniesComponent implements OnInit {
  companies: Company[];
  subscription: Subscription;
  activeEmployee: Employee;
  isLoading = false;

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute) { }


  ngOnInit() {
    this.subscription = this.store.select('company')
      .pipe(map(companieState => {
        this.isLoading = companieState.loadingAll;
        return companieState.companies;
      }))
      .subscribe(companies => {
        this.companies = companies;
      });
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
