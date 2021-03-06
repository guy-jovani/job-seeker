import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewChecked, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { Company } from '../company/company.model';
import { Employee, EmployeeJobStatus } from '../employees/employee.model';
import { switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import * as fromApp from '../store/app.reducer';
import * as JobActions from './store/job.actions';
import { State as UserState } from '../user/store/user.reducer';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit, OnDestroy, AfterViewChecked {
  subscription: Subscription;
  jobs: Employee['jobs'] | Company['jobs'];
  allowAdd = false;
  currUrl: string[] = null;
  isLoading = false;
  user: Employee | Company = null;
  kind: string = null;
  messages: string[] = [];
  selectedList = 'all';
  detailsJobUrl = '';
  availableStatus = Object.keys(EmployeeJobStatus).filter(key => isNaN(+key));
  lastJob: boolean; // if there are more jobs to fetch
  page: number;
  searchQuery: { title?: string, company?: string, published: string } = { published: 'all' };
  toggleAdvanceSearchShow = false;

  @ViewChild('container') container: ElementRef;

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subscription = this.route.params.pipe(
      switchMap(() => {
        this.currUrl = this.router.url.substring(1).split('/');
        if (this.currUrl[0] === 'my-jobs') {
          return this.store.select('user');
        } else {
          return this.store.select('job');
        }
      })
      ).subscribe(currState => {
        this.currUrl = this.router.url.substring(1).split('/');
        if (currState.messages) {
          this.messages = [...currState.messages];
        } else {
          this.messages = [];
        }
        if (this.currUrl[0] === 'my-jobs') {
          this.kind = currState['kind'];
          this.user = (currState as UserState).user;
          this.checkJobOfUser();
        } else { // /jobs
          this.checkJobsFromJobsState(currState);
        }
        this.ref.detectChanges();
        this.ref.markForCheck();
    });
  }

  checkJobOfUser() {
    this.jobs = this.user ? this.user.jobs : null;
    this.detailsJobUrl = this.selectedList + '/';
    if (this.kind === 'company') {
      this.allowAdd = true;
      this.jobs = this.jobs as Company['jobs'];
    } else {
      this.jobs = this.jobs as Employee['jobs'];
      if (!this.jobs) { return; }
      this.jobs = this.selectedList === 'all' ? this.jobs : this.jobs.filter(pos => {
        return pos.status.toString() === this.selectedList;
      });
    }
  }

  private fetchNextPage() {
    const container = this.container.nativeElement.getBoundingClientRect();
    if (this.currUrl[0] !== 'my-jobs' && // won't fetch for the user list
        !this.messages.length && // won't fetch in case of an error
        !this.isLoading && // won't fetch in a middle of a fetch
        !this.lastJob && // won't fetch if the last employee was fetched
        (container.bottom <= window.innerHeight || // if the whole list is shown - so fetch
        container.height - window.pageYOffset < window.innerHeight)) { // check if scrolled to the container
      this.store.dispatch(new JobActions.FetchJobs());
      this.ref.detectChanges();
    }
  }

  ngAfterViewChecked() {
    if (this.currUrl[0] !== 'my-applicants') {
      this.fetchNextPage();
    }
  }

  @HostListener('window:scroll', ['$event']) doSomething(event) {
    this.fetchNextPage();
  }

  private checkJobsFromJobsState(jobState) {
    this.isLoading = jobState['loadingAll'];
    if ((jobState['searchQuery'].title && this.searchQuery.title !== jobState['searchQuery'].title) ||
        (jobState['searchQuery'].company && this.searchQuery.company !== jobState['searchQuery'].company) ||
        (jobState['searchQuery'].published && this.searchQuery.published !== jobState['searchQuery'].published)) {
      this.toggleAdvanceSearchShow = true;
    }
    this.searchQuery = {...jobState['searchQuery']};
    this.jobs = jobState['jobs'];
    this.page = jobState['page'];
    this.lastJob = this.jobs.length >= jobState['total'];
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
    if (value.type === 'Job') {
      this.searchQuery.title = value.title;
    } else {
      this.searchQuery.company = value.name;
    }
  }

  onRemoveSearchField(field: string) {
    if (field === 'title') {
      this.searchQuery.title = null;
    } else {
      this.searchQuery.company = null;
    }
  }

  onSearch() {
    this.store.dispatch(new JobActions.FetchJobs({ search: { ...this.searchQuery } }));
  }


  onClose() {
    this.store.dispatch(new JobActions.ClearError());
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.currUrl.length === 1 && this.currUrl[0] === 'jobs') {
      this.onClose();
    }
  }

}
