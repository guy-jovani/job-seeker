import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import * as fromApp from '../../store/app.reducer';

@Component({
  selector: 'app-details-user',
  templateUrl: './details-user.component.html',
  styleUrls: ['./details-user.component.scss']
})
export class DetailsUserComponent implements OnInit, OnDestroy {
  userEmployee: boolean;
  authSubscription: Subscription;

  constructor(private store: Store<fromApp.AppState>) { }


  ngOnInit() {
    this.authSubscription = this.store.select('user').subscribe(userState => {
      this.userEmployee = userState.kind === 'employee';
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
