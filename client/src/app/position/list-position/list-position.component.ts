import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Position } from '../position.model';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';

import * as PositionActions from '../store/position.actions';
import * as fromApp from '../../store/app.reducer';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-list-position',
  templateUrl: './list-position.component.html',
  styleUrls: ['./list-position.component.css']
})
export class ListPositionComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  positions: Position[];
  allowAdd = false;
  currUrl: string = null;

  @Input() companyPositions: Position[] = null;

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.subscription = this.route.params.pipe(
      switchMap(() => {
        this.currUrl = this.route.snapshot['_routerState'].url.substring(1).split('/');
        if (this.currUrl[0] === 'my-positions') {
          return this.store.select('auth');
        } else {
          return this.store.select('position');
        }
      })
    ).subscribe(currState => {
      if (this.currUrl[0] === 'my-positions') { // user positions
        this.positions = currState['user'] ? currState['user']['positions'] : null;
        if (currState['kind'] === 'company') { this.allowAdd = true; }
      } else {
        if (this.companyPositions) { // positions of specific company
          this.positions = this.companyPositions;
        } else { // general positions list
          this.positions = currState['positions'];
        }
      }
    });

  }

  getPositioninfo(index: number) {
    // in company auth mode (allowAdd === true) the positions are always up to date
    /// because they are loaded initialy from the db
    if (!this.allowAdd) {
      this.store.dispatch(new PositionActions.FetchSinglePosition({
                      _id: this.positions[index]._id,
                      main: this.currUrl[0] !== 'companies' && this.currUrl.length < 3
      }));
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
