import { Component, OnInit, Input, OnDestroy, HostListener, ViewChild, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import { Employee } from 'app/employees/employee.model';
import { Company } from 'app/company/company.model';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  user: Employee | Company = null;
  searchRes: Employee[] | Company[] = null;
  nameList: {}[] = null;
  errorMessages: string[] = [];

  @ViewChild('listResults', { static: false }) listRes: ElementRef;
  @ViewChild('searchInput', { static: false }) searchInput: ElementRef;

  @Input() placeholder: string = null;
  // tslint:disable-next-line: no-input-rename
  @Input('search') searchDB: string[] = null;

  @Output() nameListEmitter = new EventEmitter<{}[]>();

  constructor(
    private http: HttpClient,
    private store: Store<fromApp.AppState>,
    private renderer2: Renderer2
  ) {}

  ngOnInit() {
    this.subscription = this.store.select('auth').subscribe(authState => {
      this.user = authState.user;
    });
    this.nameList = [];
  }

  onSearchChange(value: string) {
    const nodeServer = environment.nodeServer + 'search/';
    if (!value) {
      return this.renderer2.addClass(this.listRes.nativeElement, 'hide');
    }
    const usedIds = [this.user._id];
    this.nameList.forEach(val => usedIds.push(val['_id']));
    this.http
      .get(nodeServer, {
        params: {
          fullName: value,
          usedIds: usedIds.join(','),
          searchDB: this.searchDB.join(',')
        }
      })
      .pipe(take(1))
      .subscribe(
        res => {
          if (res['type'] === 'success') {
            this.searchRes = res['resultList'];
            this.renderer2.removeClass(this.listRes.nativeElement, 'hide');
          } else {
            this.errorMessages.push(...res['messages']);
          }
        },
        errorMessages => {
          this.errorMessages.push(...errorMessages);
        }
      );
  }

  onWantedRes(ind: number) {
    this.nameList.push(this.searchRes[ind]);
    this.searchInput.nativeElement.value = '';
    this.nameListEmitter.emit(this.nameList);
  }

  @HostListener('document:click', ['$event']) toggleOpen(event: Event) {
    this.renderer2.addClass(this.listRes.nativeElement, 'hide');
  }

  onClose() {
    this.errorMessages = [];
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
