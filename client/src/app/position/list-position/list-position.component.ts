import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Position } from '../position.model';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';

import * as PositionActions from '../store/position.actions';
import * as fromApp from '../../store/app.reducer';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-list-position',
  templateUrl: './list-position.component.html',
  styleUrls: ['./list-position.component.scss']
})
export class ListPositionComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  positions: Position[];
  allowAdd = false;
  currUrl: string[] = null;
  isLoading = false;
  errorMessages: string[] = [];
  @Input() companyPositions: Position[] = null;

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.subscription = this.route.params.pipe(
      switchMap(() => {
        this.currUrl = this.router.url.substring(1).split('/');
        if (this.currUrl[0] === 'my-positions') {
          return this.store.select('user');
        } else {
          return this.store.select('position');
        }
      }),
      ).subscribe(currState => {
        this.currUrl = this.router.url.substring(1).split('/');
        if (this.currUrl[0] === 'my-positions') {
          this.positions = currState['user'] ? currState['user']['positions'] : null;
          if (currState['kind'] === 'company') { this.allowAdd = true; }
        } else {
          if (this.companyPositions) { // companies/:companyId/position
            this.positions = this.companyPositions;
          } else { // /positions
            this.isLoading = currState['loadingAll'];
            if (this.currUrl[this.currUrl.length - 1] === 'my-positions' ||
                this.currUrl[this.currUrl.length - 1] === 'positions') {
              if (currState.messages) {
                this.errorMessages = [];
                for (const msg of currState.messages) {
                  this.errorMessages.push(msg);
                }
              } else {
                this.errorMessages = [];
              }
            }
            this.positions = currState['positions'];
          }
        }
    });

  }

  onClose() {
    this.store.dispatch(new PositionActions.ClearError());
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.currUrl.length === 1 && this.currUrl[0] === 'positions') {
      this.onClose();
    }
  }

}
