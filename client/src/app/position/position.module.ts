
import { NgModule } from '@angular/core';

import { PositionComponent } from './position.component';
import { EditPositionComponent } from './edit-position/edit-position.component';
import { ListPositionComponent } from './list-position/list-position.component';
import { PositionRoutingModule } from './position-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DetailsPositionComponent } from './details-position/details-position.component';





@NgModule({
  declarations: [
    PositionComponent,
    EditPositionComponent,
    ListPositionComponent,
    DetailsPositionComponent,
  ],
  imports: [
    SharedModule,
    PositionRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    PositionComponent,
    ListPositionComponent
  ]
})
export class PositionModule {}



