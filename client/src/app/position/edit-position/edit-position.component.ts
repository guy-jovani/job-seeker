import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import { Position } from '../position.model';
import { switchMap } from 'rxjs/operators';
import { Company } from 'app/company/company.model';

import * as PositionActions from '../store/position.actions';


@Component({
  selector: 'app-edit-position',
  templateUrl: './edit-position.component.html',
  styleUrls: ['./edit-position.component.css']
})
export class EditPositionComponent implements OnInit, OnDestroy {
  positionSub: Subscription;
  errorMessages: string[] = [];
  isLoading = false;
  positionForm: FormGroup;
  position: Position = null;
  index: number = null;
  companyId: string = null;

  constructor(
    private store: Store<fromApp.AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.positionForm = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      requirements: new FormArray([])
    });

    this.positionSub = this.route.params.pipe(
      switchMap(params => {
        if (params['index']) {
          this.index = params['index'];
        }
        return this.store.select('auth');
      }),
      switchMap(authState => {
        if (this.index !== null) {
          this.position = (authState.user as Company)['positions'][this.index];
          this.initForm();
        }
        this.companyId = authState.user._id;
        return this.store.select('position');
      })
    ).subscribe(positionState => {
      this.isLoading = positionState['loadingSingle'];
      if (positionState.messages) {
        for (const msg of positionState.messages) {
          this.errorMessages.push(msg);
        }
      } else {
        this.errorMessages = [];
      }
    });
  }

  onAddRequirement(years: number = null, skill: string = null) {
    (this.positionForm.get('requirements') as FormArray).push(
      new FormGroup({
        years: new FormControl(years, [Validators.required]),
        skill: new FormControl(skill, [Validators.required]),
      }));
  }

  onRemoveRequirement(index: number) {
    (this.positionForm.get('requirements') as FormArray).removeAt(index);
  }

  initForm() {
    if (this.index !== null) {
      this.position.requirements.forEach(req => {
        this.onAddRequirement(req.years, req.skill);
      });
      this.positionForm.patchValue({
        title: this.position.title,
        description: this.position.description,
      });
    }
  }
  onSubmit(form: NgForm) {
    const newPosition = new Position({
      title: form.value.title, description: form.value.description, companyId: {_id: this.companyId}
    });
    if (form.value.requirements.length > 0) {
      newPosition.requirements = form.value.requirements;
    }
    if (this.position) {
      newPosition._id = this.position._id;
      this.store.dispatch(new PositionActions.UpdateSinglePositionInDb(newPosition));
    } else {
      this.store.dispatch(new PositionActions.CreatePositionInDb(newPosition));
    }
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.positionSub) {
      this.positionSub.unsubscribe();
    }
  }

  onClose() {
    this.store.dispatch(new PositionActions.ClearError());
  }

}
