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
  wantedResults: Map<string, {}> = null;
  messages: string[] = [];

  @ViewChild('listResults') listRes: ElementRef;
  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() placeholder: string = null;
  // tslint:disable-next-line: no-input-rename
  @Input('search') searchDB: string[] = null;

  @Output() wantedResultsEmitter = new EventEmitter<Map<string, {}>>();

  constructor(
    private http: HttpClient,
    private store: Store<fromApp.AppState>,
    private renderer2: Renderer2
  ) {}

  ngOnInit() {
    this.subscription = this.store.select('user').subscribe(userState => {
      this.user = userState.user;
    });
    this.wantedResults = new Map<string, {}>();
  }

  onSearchChange(value: string) {
    const nodeServer = environment.nodeServer + 'search/';
    if (!value) {
      return this.renderer2.addClass(this.listRes.nativeElement, 'hide');
    }
    const usedIds = Array.from( this.wantedResults.keys() );
    usedIds.push(this.user._id);
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
            this.messages.push(...res['messages']);
          }
        },
        messages => {
          this.messages.push(...messages);
        }
      );
  }

  onWantedRes(ind: number) {
    console.log(this.searchRes[ind])
    this.wantedResults.set(this.searchRes[ind]._id, this.searchRes[ind]);
    this.searchInput.nativeElement.value = '';
    this.wantedResultsEmitter.emit(this.wantedResults);
  }

  @HostListener('document:click', ['$event']) toggleOpen(event: Event) {
    this.renderer2.addClass(this.listRes.nativeElement, 'hide');
  }

  onClose() {
    this.messages = [];
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
