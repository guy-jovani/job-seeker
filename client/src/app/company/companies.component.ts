import { Component, OnInit, OnDestroy, HostListener,
        ViewChild, ElementRef, AfterViewChecked,
        ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import { Company } from './company.model';
import { Employee } from 'app/employees/employee.model';
import * as CompanyActions from './store/company.actions';
import * as fromApp from '../store/app.reducer';


@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit, OnDestroy, AfterViewChecked {
  companies: Company[];
  subscription: Subscription;
  activeEmployee: Employee;
  isLoading = false;
  messages: string[] = [];
  currUrl: string[] = null;
  page: number;
  lastCompany: boolean; // if there are more companies to fetch

  @ViewChild('containerFluid') containerFluid: ElementRef;

  constructor(private store: Store<fromApp.AppState>,
              private ref: ChangeDetectorRef,
              private router: Router) { }

  ngOnInit() {

    this.subscription = this.store.select('company')
      .subscribe(companyState => {
        this.currUrl = this.router.url.substring(1).split('/');
        this.isLoading = companyState.loadingAll;
        this.page = companyState.page;
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
        this.lastCompany = this.companies.length >= companyState.total;
      });
  }

  private fetchNextPage() {
    const container = this.containerFluid.nativeElement.getBoundingClientRect();
    if (!this.messages.length && // won't fetch in case of an error
        !this.isLoading && // won't fetch in a middle of a fetch
        !this.lastCompany && // won't fetch if the last company was fetched
        (container.bottom <= window.innerHeight || // if the whole list is shown - so fetch
        container.height - window.pageYOffset < window.innerHeight)) { // check if scrolled to the container
      this.store.dispatch(new CompanyActions.FetchCompanies({ page: this.page }));
      this.ref.detectChanges();
    }
  }

  ngAfterViewChecked() {
    this.fetchNextPage();
  }

  @HostListener('window:scroll', ['$event']) doSomething(event) {
    this.fetchNextPage();
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
