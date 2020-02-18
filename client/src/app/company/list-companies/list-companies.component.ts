import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import * as fromApp from '../../store/app.reducer';
import { Company } from '../company.model';
import { Employee } from 'app/employees/employee.model';
import * as CompanyActions from '../store/company.actions';

@Component({
  selector: 'app-list-companies',
  templateUrl: './list-companies.component.html',
  styleUrls: ['./list-companies.component.css']
})
export class ListCompaniesComponent implements OnInit, OnDestroy {
  companies: Company[];
  subscription: Subscription;
  activeEmployee: Employee;
  isLoading = false;

  constructor(private store: Store<fromApp.AppState>) { }

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

  getCompanyinfo(index: number) {
    this.store.dispatch(new CompanyActions.FetchSingleCompany({
                _id: this.companies[index]._id, main: true
    }));
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
