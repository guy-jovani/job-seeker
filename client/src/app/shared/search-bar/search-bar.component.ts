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
  searchRes: {
    _id: string,
    type: string,
    [field: string]: string
  }[] = null;
  wantedResults: Map<string, {}> = null;
  messages: string[] = [];

  @ViewChild('listResults') listRes: ElementRef;
  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() placeholder: string = null;
  @Input() searchDBs: string[] = null;
  @Input() searchFields: string[] = null;
  @Input() distinctResults = false;

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

    // usedIds are for the server to know which documents it should ignore since it already retrieved them.
    // In case of a request for a distinct request the field will be the values of the field that was
    // retrieved (otherwise it will be the object id)
    const usedIds = Array.from( this.wantedResults.keys() );

    this.http
      .get(nodeServer, {
        params: {
          query: value,
          distinct: this.distinctResults.toString(),
          usedIds: usedIds.join(environment.splitSearchQueryBy),
          searchDBs: this.searchDBs.join(environment.splitSearchQueryBy),
          searchFields: this.searchFields.join(environment.splitSearchQueryBy)
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
    this.wantedResults.set(this.searchRes[ind]._id, this.searchRes[ind]);
    this.searchInput.nativeElement.value = '';
    this.wantedResultsEmitter.emit(this.wantedResults);
  }


  showSearchResult() {
    return this.searchRes ? this.searchRes.map(res => {
      const resultsFields = this.searchFields.filter(sf => {
        return res[sf];
      }).map(sfRes => {
        return res[sfRes];
      });
      const show = resultsFields[0];
      if (resultsFields.length === 1) {
        return this.user && this.user._id === res._id ? show + ' (you)' : show;
      } else {
        return this.user && this.user._id === res._id ? show + ' (you)' : show + ' (' + resultsFields[1] + ')';
      }
    }) : [];
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
