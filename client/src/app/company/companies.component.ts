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
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit, OnDestroy, AfterViewChecked {
  companies: Company[];
  subscription: Subscription;
  isLoading = false;
  messages: string[] = [];
  currUrl: string[] = null;
  page: number;
  userId: string = null;
  lastCompany: boolean; // if there are more companies to fetch
  searchQuery: { name?: string, job?: string, published: string } = { published: 'all' };
  toggleAdvanceSearchShow = false;

  @ViewChild('containerFluid') containerFluid: ElementRef;

  constructor(private store: Store<fromApp.AppState>,
              private ref: ChangeDetectorRef,
              private router: Router) { }

  ngOnInit() {

    this.subscription = this.store.select('user').pipe(
      switchMap(userState => {
        this.userId = userState.user ? userState.user._id : null;
        return this.store.select('company');
      })
    ).subscribe(companyState => {
        this.currUrl = this.router.url.substring(1).split('/');
        this.isLoading = companyState.loadingAll;
        this.page = companyState.page;
        if (this.currUrl[this.currUrl.length - 1] === 'companies') {
          this.messages = companyState.messages;
        }

        if ((companyState['searchQuery'].name && this.searchQuery.name !== companyState['searchQuery'].name) ||
            (companyState['searchQuery'].job && this.searchQuery.job !== companyState['searchQuery'].job) ||
            (companyState['searchQuery'].published && this.searchQuery.published !== companyState['searchQuery'].published)) {
          this.toggleAdvanceSearchShow = true;
        }
        this.searchQuery = { ...companyState['searchQuery'] };
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
      this.store.dispatch(new CompanyActions.FetchCompanies());
      this.ref.detectChanges();
    }
  }

  ngAfterViewChecked() {
    this.fetchNextPage();
  }

  @HostListener('window:scroll', ['$event']) doSomething(event) {
    this.fetchNextPage();
  }

  onAdvanceSearch() {
    this.toggleAdvanceSearchShow = !this.toggleAdvanceSearchShow;
  }

  onSearchField(searchMap: Map<string, {
    _id: string,
    field: string,
    type: string
  }>) {
    const value = searchMap.entries().next().value[1];
    if (value.name) {
      this.searchQuery.name = value.name;
    } else {
      this.searchQuery.job = value['jobs.title'];
    }
  }

  onRemoveSearchField(field: string) {
    if (field === 'name') {
      this.searchQuery.name = null;
    } else {
      this.searchQuery.job = null;
    }
  }

  onSearch() {
    this.store.dispatch(new CompanyActions.FetchCompanies({ search: { ...this.searchQuery } }));
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
