import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as CompanyActions from '../store/company.actions';
import * as fromApp from '../../store/app.reducer';
import { Company } from '../company.model';
import { Employee } from 'app/employees/employee.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-companies',
  templateUrl: './list-companies.component.html',
  styleUrls: ['./list-companies.component.scss']
})
export class ListCompaniesComponent implements OnInit, OnDestroy {
  companies: Company[];
  subscription: Subscription;
  activeEmployee: Employee;
  isLoading = false;
  messages: string[] = [];
  currUrl: string[] = null;

  constructor(private store: Store<fromApp.AppState>,
              private router: Router) { }

  ngOnInit() {

    this.subscription = this.store.select('company')
      .subscribe(companyState => {
        this.currUrl = this.router.url.substring(1).split('/');
        this.isLoading = companyState.loadingAll;
        if (this.currUrl[this.currUrl.length - 1] === 'companies') {
          if (companyState.messages) {
            this.messages = [];
            for (const msg of companyState.messages) {
              this.messages.push(msg);
            }
          } else {
            this.messages = [];
          }
        }
        this.companies = companyState.companies;
      });
  }

  onClose() {
    this.store.dispatch(new CompanyActions.ClearError());
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.onClose();
  }
}
