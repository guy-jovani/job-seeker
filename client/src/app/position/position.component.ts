import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';


import * as fromApp from '../store/app.reducer';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as PositionActions from './store/position.actions';


@Component({
  selector: 'app-position',
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.css']
})
export class PositionComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  errorMessages: string[] = [];

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.routeSub = this.store.select('position')
      .subscribe(positionState => {
        if (positionState.messages) {
          for (const msg of positionState.messages) {
            this.errorMessages.push(msg);
          }
        } else {
          this.errorMessages = [];
        }
      });
  }

  onClose() {
    this.store.dispatch(new PositionActions.ClearError());
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

}
