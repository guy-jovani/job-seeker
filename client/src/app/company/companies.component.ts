import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromApp from '../store/app.reducer';
import * as CompanyActions from './store/company.actions';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit, OnDestroy {
  storeSubscription: Subscription;
  errorMessages: string[] = [];

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.storeSubscription = this.store.select('company')
      .subscribe(
        companyState => {
          if (companyState.messages) {
            for (const msg of companyState.messages) {
              this.errorMessages.push(msg);
            }
          } else {
            this.errorMessages = [];
          }
        }
      );
  }

  ngOnDestroy() {
    if (this.storeSubscription) {
      this.storeSubscription.unsubscribe();
    }
  }

  onClose() {
    this.store.dispatch(new CompanyActions.ClearError());
  }
}
